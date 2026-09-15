"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Plus,
  Save,
  Trash2,
  X,
  Search,
  Layers,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusMessage } from "@/components/status-message";
import { formatPrice, parsePrice, slugify } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";
import {
  createItem,
  createVariant,
  deleteItem,
  deleteVariant,
  getItems,
  toggleItemAvailability,
  updateItem,
  updateVariant,
} from "./actions";
import { getCategories } from "../categories/actions";

type VariantForm = {
  id?: string;
  name: string;
  price: string;
  image_url: string;
  is_available: boolean;
  display_order: number;
};

type ItemForm = {
  id?: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  has_variants: boolean;
  is_available: boolean;
  is_featured: boolean;
  display_order: string;
  variants: VariantForm[];
};

const emptyForm: ItemForm = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  image_url: "",
  has_variants: false,
  is_available: true,
  is_featured: false,
  display_order: "10",
  variants: [],
};

export default function ItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, itemsData] = await Promise.all([
          getCategories(),
          getItems(),
        ]);

        setCategories(categoriesData);
        setItems(itemsData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les données.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category_id === categoryFilter;

      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, search, items]);

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  function editItem(item: MenuItem) {
    setForm({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      slug: item.slug ?? "",
      description: item.description ?? "",
      price: item.price === null ? "" : String(item.price),
      image_url: item.image_url ?? "",
      has_variants: item.has_variants,
      is_available: item.is_available,
      is_featured: item.is_featured,
      display_order: String(item.display_order),

      variants: (item.menu_item_variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: String(variant.price),
        image_url: variant.image_url || "",
        is_available: variant.is_available,
        display_order: variant.display_order,
      })),
    });

    setError(null);
    setSuccess(null);

    setTimeout(() => {
      const el = document.getElementById("name");

      if (el) {
        el.focus();
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 10);
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          name: "",
          price: "",
          image_url: "",
          is_available: true,
          display_order: current.variants.length * 10 + 10,
        },
      ],
    }));
  }

  function updateVariantForm(index: number, update: Partial<VariantForm>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...update } : variant,
      ),
    }));
  }

  function removeVariant(index: number) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const categoryId = form.category_id || categories[0]?.id;

    if (!categoryId) {
      setError("Veuillez d'abord créer une catégorie.");
      return;
    }

    if (!form.name.trim()) {
      setError("Le nom de l'article est obligatoire.");
      return;
    }

    const price = form.has_variants ? null : parsePrice(form.price);

    if (!form.has_variants && price === null) {
      setError("Le prix (DT) est obligatoire pour les articles sans variante.");
      return;
    }

    if (form.has_variants) {
      const invalidVariant = form.variants.find(
        (variant) => !variant.name.trim() || parsePrice(variant.price) === null,
      );

      if (invalidVariant) {
        setError("Chaque variante nécessite un nom et un prix (DT).");
        return;
      }
    }

    const payload = {
      category_id: categoryId,
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      price,
      image_url: form.image_url.trim(),
      has_variants: form.has_variants,
      is_available: form.is_available,
      is_featured: form.is_featured,
      display_order: Number(form.display_order) || 10,
    };

    /*
     * UPDATE EXISTING ITEM
     */
    if (form.id) {
      try {
        const updatedItem = await updateItem(form.id, payload);

        const existingVariants = updatedItem.menu_item_variants ?? [];

        const formVariantIds = new Set(
          form.variants
            .filter((variant) => variant.id)
            .map((variant) => variant.id as string),
        );

        /*
         * Delete variants that were removed from the form.
         *
         * If has_variants was switched off, form.variants is empty
         * and therefore all existing variants are deleted.
         */
        for (const existingVariant of existingVariants) {
          if (!formVariantIds.has(existingVariant.id)) {
            await deleteVariant(existingVariant.id);
          }
        }

        const savedVariants = [];

        /*
         * Save remaining/existing variants and create new ones.
         */
        if (form.has_variants) {
          for (const variant of form.variants) {
            const variantPayload = {
              name: variant.name.trim(),
              price: parsePrice(variant.price) ?? 0,
              image_url: variant.image_url.trim() || null,
              is_available: variant.is_available,
              display_order: Number(variant.display_order) || 10,
            };

            if (variant.id) {
              /*
               * Existing variant → UPDATE in Supabase.
               */
              const savedVariant = await updateVariant(
                variant.id,
                variantPayload,
              );

              savedVariants.push(savedVariant);
            } else {
              /*
               * New variant → INSERT in Supabase.
               */
              const createdVariant = await createVariant({
                item_id: form.id,
                ...variantPayload,
              });

              savedVariants.push(createdVariant);
            }
          }
        }

        updatedItem.menu_item_variants = savedVariants;

        setItems((current) =>
          current.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        );

        setSuccess("Article mis à jour.");

        setForm({
          ...emptyForm,
          category_id: categories[0]?.id || "",
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour l'article.",
        );
        return;
      }
    } else {
      /*
       * CREATE NEW ITEM
       */
      try {
        const newItem = await createItem(payload);

        if (form.has_variants) {
          const createdVariants = [];

          for (const variant of form.variants) {
            const createdVariant = await createVariant({
              item_id: newItem.id,
              name: variant.name.trim(),
              price: parsePrice(variant.price) ?? 0,
              image_url: variant.image_url.trim() || null,
              is_available: variant.is_available,
              display_order: Number(variant.display_order) || 10,
            });

            createdVariants.push(createdVariant);
          }

          newItem.menu_item_variants = createdVariants;
        }

        setItems((current) => [...current, newItem]);

        setSuccess("Nouvel article ajouté au menu.");

        setForm({
          ...emptyForm,
          category_id: categories[0]?.id || "",
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter l'article.",
        );
        return;
      }
    }

    setForm({
      ...emptyForm,
      category_id: categories[0]?.id || "",
    });
  }

  async function handleToggleAvailability(item: MenuItem) {
    setError(null);
    setSuccess(null);

    try {
      const updatedItem = await toggleItemAvailability(
        item.id,
        !item.is_available,
      );

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem,
        ),
      );

      setSuccess(
        updatedItem.is_available
          ? "Article rendu disponible."
          : "Article masqué.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la disponibilité.",
      );
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`Supprimer "${item.name}" du menu ?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteItem(item.id);

      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id),
      );

      if (form.id === item.id) {
        setForm({
          ...emptyForm,
          category_id: categories[0]?.id || "",
        });
      }

      setSuccess("Article supprimé.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'article.",
      );
    }
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Articles du Menu"
        description="Gérez les tarifs (en DT), photos, disponibilités et variantes."
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({
                ...emptyForm,
                category_id: categories[0]?.id || "",
              });

              setError(null);
              setSuccess(null);

              setTimeout(() => {
                const el = document.getElementById("name");

                if (el) {
                  el.focus();
                  el.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }, 10);
            }}
            type="button"
          >
            <Plus size={16} />
            <span>Nouveau Produit</span>
          </button>
        }
      />

      <div className="grid grid-split">
        {/* Left Column: Items List */}
        <section className="panel">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Produits ({filteredItems.length})
              </h2>

              <p className="section-subtitle">
                Utilisez les filtres ci-dessous pour trouver rapidement un
                produit.
              </p>
            </div>

            <div className="search-wrapper">
              <Search size={15} className="search-icon" />

              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="filter-pills">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`filter-pill ${
                categoryFilter === "all" ? "filter-pill--active" : ""
              }`}
            >
              Tous ({items.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`filter-pill ${
                  categoryFilter === cat.id ? "filter-pill--active" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              Aucun produit trouvé dans cette catégorie.
            </div>
          ) : (
            <div className="item-list">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`menu-card ${
                    form.id === item.id ? "menu-card--active" : ""
                  }`}
                >
                  <div className="menu-card-top">
                    <img
                      src={
                        item.image_url ||
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={item.name}
                      className="menu-card-img"
                    />

                    <div className="menu-card-body">
                      <div className="menu-card-title">
                        <div className="menu-card-title-left">
                          <h3>{item.name}</h3>

                          {item.is_featured && (
                            <span className="badge badge-warning">
                              <Star size={11} />
                              Vedette
                            </span>
                          )}
                        </div>

                        <span className="menu-card-price">
                          {item.has_variants
                            ? "Variantes"
                            : formatPrice(item.price)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="menu-card-desc">{item.description}</p>
                      )}

                      {item.has_variants && (
                        <div className="variant-tags">
                          {(item.menu_item_variants ?? []).map((variant) => (
                            <span key={variant.id} className="variant-tag">
                              {variant.name}:{" "}
                              <strong>{formatPrice(variant.price)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="menu-card-actions">
                    <div className="menu-card-actions-left">
                      <span
                        className={`availability-label ${
                          item.is_available
                            ? "availability-label--available"
                            : "availability-label--hidden"
                        }`}
                      >
                        {item.is_available ? "En Stock" : "Masqué"}
                      </span>

                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.is_available}
                          onChange={() => handleToggleAvailability(item)}
                        />

                        <span className="slider" />
                      </label>
                    </div>

                    <div className="menu-card-actions-right">
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => editItem(item)}
                        title="Modifier le produit"
                        type="button"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(item)}
                        title="Supprimer le produit"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Form */}
        <section className="panel items-form-panel">
          <div className="panel-header">
            <div>
              <h2>{form.id ? "Modifier le Produit" : "Nouveau Produit"}</h2>

              <p>Remplissez les détails et les tarifs en DT.</p>
            </div>

            {form.id && (
              <button
                className="btn btn-secondary btn--sm"
                onClick={() =>
                  setForm({
                    ...emptyForm,
                    category_id: categories[0]?.id || "",
                  })
                }
                type="button"
              >
                <X size={14} />
                <span>Annuler</span>
              </button>
            )}
          </div>

          <form className="form" onSubmit={handleSave}>
            <StatusMessage error={error} success={success} />

            <div className="form-group">
              <label htmlFor="category_id">Catégorie *</label>

              <select
                id="category_id"
                className="select"
                required
                value={form.category_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Choisir une catégorie...
                </option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Nom du Produit *</label>

              <input
                id="name"
                className="input"
                placeholder="ex: Milkshake Fraise"
                required
                value={form.name}
                onChange={(e) => updateName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                className="textarea"
                placeholder="Ingrédients, details..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Prix en DT *</label>

                <input
                  id="price"
                  className="input"
                  disabled={form.has_variants}
                  placeholder={
                    form.has_variants ? "Géré par variantes" : "8.500"
                  }
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="display_order">Ordre d&apos;affichage</label>

                <input
                  id="display_order"
                  type="number"
                  className="input"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      display_order: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image_url">URL Photo du Produit</label>

              <input
                id="image_url"
                className="input"
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) =>
                  setForm({
                    ...form,
                    image_url: e.target.value,
                  })
                }
              />
            </div>

            {/* Checkboxes */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.has_variants}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      has_variants: e.target.checked,
                    })
                  }
                />

                <span>Contient plusieurs variantes (ex: Vanille, Caramel)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_featured: e.target.checked,
                    })
                  }
                />

                <span>Mettre en vedette (Coup de Cœur)</span>
              </label>
            </div>

            {/* Variant Builder */}
            {form.has_variants && (
              <div className="variant-builder">
                <div className="variant-builder-header">
                  <span className="variant-builder-label">
                    <Layers size={15} />
                    Variantes
                  </span>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="btn btn-secondary btn--sm"
                  >
                    <Plus size={13} />
                    <span>Ajouter variante</span>
                  </button>
                </div>

                <div className="variant-builder-rows">
                  {form.variants.map((variant, index) => (
                    <div
                      key={variant.id ?? `new-${index}`}
                      className="variant-builder-row"
                    >
                      <input
                        placeholder="Nom (ex: Vanille)"
                        className="input input--sm"
                        value={variant.name}
                        onChange={(e) =>
                          updateVariantForm(index, {
                            name: e.target.value,
                          })
                        }
                      />

                      <input
                        placeholder="Prix DT"
                        className="input input--sm"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantForm(index, {
                            price: e.target.value,
                          })
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="btn btn-danger btn-icon btn-icon--sm"
                        title="Supprimer la variante"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="btn btn-primary btn--full"
                disabled={loading}
              >
                <Save size={16} />

                <span>
                  {form.id
                    ? "Enregistrer les modifications"
                    : "Ajouter au Menu"}
                </span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
