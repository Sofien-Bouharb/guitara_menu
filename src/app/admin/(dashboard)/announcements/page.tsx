"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Edit2, Plus, Save, Trash2, X, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusMessage } from "@/components/status-message";
import type { Announcement } from "@/lib/types";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  toggleAnnouncementActive,
  updateAnnouncement,
} from "./actions";

type AnnouncementForm = {
  id?: string;
  title: string;
  message: string;
  variant: Announcement["variant"];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  display_order: string;
};

const emptyForm: AnnouncementForm = {
  title: "",
  message: "",
  variant: "promo",
  starts_at: "",
  ends_at: "",
  is_active: true,
  display_order: "10",
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<AnnouncementForm>(emptyForm);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formPanelRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les annonces.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  function editAnnouncement(announcement: Announcement) {
    setForm({
      id: announcement.id,
      title: announcement.title ?? "",
      message: announcement.message,
      variant: announcement.variant,
      starts_at: announcement.starts_at ?? "",
      ends_at: announcement.ends_at ?? "",
      is_active: announcement.is_active,
      display_order: String(announcement.display_order),
    });

    setError(null);
    setSuccess(null);
  }

  function handleNewAnnouncement() {
    setForm(emptyForm);
    setError(null);
    setSuccess(null);

    requestAnimationFrame(() => {
      formPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 400);
    });
  }
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!form.message.trim()) {
      setError("Le contenu du message est obligatoire.");
      return;
    }

    const payload = {
      title: form.title.trim() || null,
      message: form.message.trim(),
      variant: form.variant,
      placement: "banner" as const,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 10,
    };

    try {
      if (form.id) {
        const updatedAnnouncement = await updateAnnouncement(form.id, payload);

        setAnnouncements((current) =>
          current.map((announcement) =>
            announcement.id === updatedAnnouncement.id
              ? updatedAnnouncement
              : announcement,
          ),
        );

        setSuccess("Annonce mise à jour.");
      } else {
        const newAnnouncement = await createAnnouncement(payload);

        setAnnouncements((current) => [...current, newAnnouncement]);

        setSuccess("Nouvelle annonce publiée.");
      }

      setForm(emptyForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer l'annonce.",
      );
    }
  }

  async function handleDelete(announcement: Announcement) {
    if (!window.confirm("Supprimer ce message d'annonce ?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteAnnouncement(announcement.id);

      setAnnouncements((current) =>
        current.filter(
          (currentAnnouncement) => currentAnnouncement.id !== announcement.id,
        ),
      );

      if (form.id === announcement.id) {
        setForm(emptyForm);
      }

      setSuccess("Annonce supprimée.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'annonce.",
      );
    }
  }

  async function handleToggleActive(announcement: Announcement) {
    setError(null);
    setSuccess(null);

    try {
      const updatedAnnouncement = await toggleAnnouncementActive(
        announcement.id,
        !announcement.is_active,
      );

      setAnnouncements((current) =>
        current.map((currentAnnouncement) =>
          currentAnnouncement.id === updatedAnnouncement.id
            ? updatedAnnouncement
            : currentAnnouncement,
        ),
      );

      setSuccess(
        updatedAnnouncement.is_active
          ? "Annonce activée."
          : "Annonce désactivée.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier l'annonce.",
      );
    }
  }

  const previewVariantClass =
    form.variant === "promo"
      ? "announcement-preview--promo"
      : form.variant === "warning"
        ? "announcement-preview--warning"
        : form.variant === "success"
          ? "announcement-preview--success"
          : "announcement-preview--info";

  return (
    <div className="page-content">
      <PageHeader
        title="Annonces Homepage"
        description="Diffusez des réductions (Examens), fermetures ou infos Wi-Fi."
        action={
          <button
            className="btn btn-primary"
            onClick={handleNewAnnouncement}
            type="button"
          >
            <Plus size={15} />
            <span>Nouvelle Annonce</span>
          </button>
        }
      />

      <div className="grid grid-split">
        <section ref={formPanelRef} className="panel">
          <div className="panel-header">
            <div>
              <h2>Messages ({announcements.length})</h2>

              <p>Affichés en haut du menu client.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Chargement des annonces...</div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">Aucune annonce.</div>
          ) : (
            <div className="announcement-list">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`announcement-card ${
                    form.id === ann.id ? "announcement-card--active" : ""
                  }`}
                >
                  <div className="announcement-card-top">
                    <div className="announcement-card-content">
                      <div className="announcement-card-title-row">
                        {ann.title && <h3>{ann.title}</h3>}

                        <span
                          className={`badge ${
                            ann.variant === "promo"
                              ? "badge-promo"
                              : ann.variant === "warning"
                                ? "badge-warning"
                                : ann.variant === "success"
                                  ? "badge-success"
                                  : "badge-info"
                          }`}
                          style={{
                            fontSize: "10px",
                          }}
                        >
                          {ann.variant.toUpperCase()}
                        </span>
                      </div>

                      <p className="announcement-card-msg">{ann.message}</p>
                    </div>

                    <div className="announcement-card-toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={ann.is_active}
                          onChange={() => handleToggleActive(ann)}
                        />

                        <span className="slider" />
                      </label>
                    </div>
                  </div>

                  <div className="announcement-card-footer">
                    <span>Affichage : Bandeau Top</span>

                    <div className="announcement-card-actions">
                      <button
                        className="btn btn-secondary btn-icon btn-icon--sm"
                        onClick={() => editAnnouncement(ann)}
                        title="Modifier"
                        type="button"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        className="btn btn-danger btn-icon btn-icon--sm"
                        onClick={() => handleDelete(ann)}
                        title="Supprimer"
                        type="button"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="side-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>
                  {form.id ? "Modifier l'Annonce" : "Rédiger une Annonce"}
                </h2>
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
                <label htmlFor="title">Titre (Optionnel)</label>

                <input
                  ref={titleInputRef}
                  id="title"
                  className="input"
                  placeholder="ex: Offre Période d'Examens 🎓"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>

                <textarea
                  id="message"
                  className="textarea"
                  placeholder="ex: -15% sur tous les cafés entre 14h et 17h..."
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="variant">Style</label>

                  <select
                    id="variant"
                    className="select"
                    value={form.variant}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        variant: e.target.value as Announcement["variant"],
                      })
                    }
                  >
                    <option value="promo">Promo (Violet)</option>

                    <option value="info">Info (Bleu)</option>

                    <option value="warning">Alerte (Orange)</option>

                    <option value="success">Succès (Vert)</option>
                  </select>
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-primary btn--full">
                  <Save size={15} />

                  <span>{form.id ? "Enregistrer" : "Publier l'Annonce"}</span>
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="announcement-preview-label">
              <Sparkles size={15} />
              <span>Aperçu Visuel en Direct</span>
            </div>

            <div
              className={`announcement-preview ${previewVariantClass}`}
              style={{ marginTop: "8px" }}
            >
              <Sparkles size={16} />

              <div className="announcement-preview-content">
                <div className="announcement-preview-title">
                  {form.title || "Titre de l'annonce..."}
                </div>

                <div className="announcement-preview-msg">
                  {form.message || "Votre message s'affichera ici en direct..."}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
