"use client";

import { FormEvent, useEffect, useState } from "react";
import { Edit2, Plus, Save, Trash2, X, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusMessage } from "@/components/status-message";
import { slugify } from "@/lib/format";
import type { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  getCategories,
  createCategory,
  updateCategory as updateCategoryInSupabase,
  deleteCategory as deleteCategoryInSupabase,
  toggleCategoryActive as toggleCategoryActiveInSupabase,
} from "./actions";

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  display_order: "10",
  is_active: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les catégories.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  function editCategory(category: Category) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image_url: category.image_url ?? "",
      display_order: String(category.display_order),
      is_active: category.is_active,
    });
    setError(null);
    setSuccess(null);
  }

  async function handleToggleActive(category: Category) {
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("AUTH USER:", user);
      console.log("AUTH ERROR:", authError);
      const updatedCategory = await toggleCategoryActiveInSupabase(
        category.id,
        !category.is_active,
      );

      setCategories((current) =>
        current.map((item) =>
          item.id === updatedCategory.id ? updatedCategory : item,
        ),
      );

      setSuccess(
        updatedCategory.is_active ? "Catégorie activée." : "Catégorie masquée.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut.",
      );
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Le nom de la catégorie est obligatoire.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      image_url: form.image_url.trim(),
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        const updatedCategory = await updateCategoryInSupabase(
          form.id,
          payload,
        );

        setCategories((current) =>
          current.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );

        setSuccess("Catégorie mise à jour.");
      } else {
        const newCategory = await createCategory(payload);

        setCategories((current) => [...current, newCategory]);

        setSuccess("Nouvelle catégorie ajoutée.");
      }

      setForm(emptyForm);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    }
  }

  async function handleDelete(category: Category) {
    if (
      !window.confirm(`Voulez-vous vraiment supprimer "${category.name}" ?`)
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteCategoryInSupabase(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      if (form.id === category.id) {
        setForm(emptyForm);
      }

      setSuccess("Catégorie supprimée.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la catégorie.",
      );
    }
  }
  return (
    <div className="page-content">
      <PageHeader
        title="Catégories du Menu"
        description="Gérez les sections principales (Cafés, Milkshakes, Crêpes...)."
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm(emptyForm);
              setError(null);
              setSuccess(null);
            }}
            type="button"
          >
            <Plus size={15} />
            <span>Nouvelle Catégorie</span>
          </button>
        }
      />

      <div className="grid grid-split">
        {/* Left Column: Categories List */}
        <section className="panel">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Sections ({filteredCategories.length})
              </h2>
              <p className="section-subtitle">Visibles sur le menu QR Code.</p>
            </div>

            {/* Search Input */}
            <div className="search-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Categories Cards */}
          {filteredCategories.length === 0 ? (
            <div className="empty-state">Aucune catégorie trouvée.</div>
          ) : (
            <div className="category-list">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${form.id === category.id ? "category-card--active" : ""}`}
                >
                  <div className="category-card-main">
                    <img
                      src={
                        category.image_url ||
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={category.name}
                      className="category-card-image"
                    />
                    <div className="category-card-info">
                      <div className="category-card-title-row">
                        <h3>{category.name}</h3>
                        <span className="badge badge-default">
                          #{category.display_order}
                        </span>
                      </div>
                      {category.description && (
                        <p className="category-card-desc">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="category-card-footer">
                    <div className="category-card-status">
                      <span
                        className="category-card-status-label"
                        style={{
                          color: category.is_active
                            ? "var(--success)"
                            : "var(--text-muted)",
                        }}
                      >
                        {category.is_active ? "Active" : "Masquée"}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={category.is_active}
                          onChange={() => handleToggleActive(category)}
                        />
                        <span className="slider" />
                      </label>
                    </div>

                    <div className="category-card-actions">
                      <button
                        className="btn btn-secondary btn-icon btn-icon--sm"
                        onClick={() => editCategory(category)}
                        title="Modifier"
                        type="button"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-icon--sm"
                        onClick={() => handleDelete(category)}
                        title="Supprimer"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Form */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                {form.id ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
              </h2>
              <p>Formulaire de création / édition.</p>
            </div>
            {form.id && (
              <button
                className="btn btn-secondary btn--sm"
                onClick={() => setForm(emptyForm)}
                type="button"
              >
                <X size={13} />
                <span>Annuler</span>
              </button>
            )}
          </div>

          <form className="form" onSubmit={handleSave}>
            <StatusMessage error={error} success={success} />

            <div className="form-group">
              <label htmlFor="name">Nom de la Catégorie *</label>
              <input
                id="name"
                className="input"
                placeholder="ex: Nos Milkshakes & Smoothies"
                required
                value={form.name}
                onChange={(e) => updateName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optionnelle)</label>
              <textarea
                id="description"
                className="textarea"
                placeholder="Sous-titre affiché sur le menu..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">URL de l&apos;image</label>
              <input
                id="image_url"
                className="input"
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="display_order">Ordre d&apos;affichage</label>
                <input
                  id="display_order"
                  type="number"
                  className="input"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({ ...form, display_order: e.target.value })
                  }
                />
              </div>

              <div
                className="form-group"
                style={{ justifyContent: "flex-end" }}
              >
                <label
                  className="checkbox-label"
                  style={{ paddingBottom: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  <span>Catégorie Active</span>
                </label>
              </div>
            </div>

            <div>
              <button type="submit" className="btn btn-primary btn--full">
                <Save size={15} />
                <span>{form.id ? "Enregistrer" : "Créer la Catégorie"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
