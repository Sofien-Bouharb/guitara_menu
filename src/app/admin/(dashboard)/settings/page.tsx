"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Clock, Info, RefreshCw, Wifi } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusMessage } from "@/components/status-message";
import { parsePrice, formatPrice } from "@/lib/format";
import { getBusinessSettings, updateBusinessSettings } from "./actions";

export default function SettingsPage() {
  const [fee, setFee] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getBusinessSettings();

        setFee(String(settings.workspace_extra_hourly_fee));

        setMessage(settings.workspace_extra_fee_message);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les réglages.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const parsedFee = parsePrice(fee);

    if (parsedFee === null || parsedFee < 0) {
      setError("Le supplément horaire doit être un nombre positif ou zéro.");
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Le message d'information est obligatoire.");
      return;
    }

    setSaving(true);

    try {
      const updatedSettings = await updateBusinessSettings({
        workspace_extra_hourly_fee: parsedFee,
        workspace_extra_fee_message: trimmedMessage,
      });

      setFee(String(updatedSettings.workspace_extra_hourly_fee));

      setMessage(updatedSettings.workspace_extra_fee_message);

      setSuccess("Réglages de l'espace mis à jour.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour les réglages.",
      );
    } finally {
      setSaving(false);
    }
  }

  function generateMessage() {
    const parsedFee = parsePrice(fee) ?? 0;
    const formattedFee = formatPrice(parsedFee);

    setMessage(
      `Un supplément de ${formattedFee} par heure peut être appliqué pour les longues durées d'occupation d'espace de travail.`,
    );
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Réglages de l'Espace Co-working"
        description="Configurez le supplément longue durée et les règles d'espace."
      />

      <div className="grid grid-split">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Supplément Longue Durée Co-working</h2>

              <p>Affiché sous l&apos;en-tête du menu client.</p>
            </div>
          </div>

          <form className="form" onSubmit={handleSave}>
            <StatusMessage error={error} success={success} />

            {loading ? (
              <div className="empty-state">Chargement des réglages...</div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="fee">Supplément Horaire (DT / heure)</label>

                  <div className="fee-row">
                    <input
                      id="fee"
                      className="input input--bold"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="0.500"
                      required
                    />

                    <button
                      type="button"
                      onClick={generateMessage}
                      className="btn btn-secondary"
                      title="Générer automatiquement le texte"
                    >
                      <RefreshCw size={14} />
                      <span>Générer Texte</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    Message d&apos;Information Client
                  </label>

                  <textarea
                    id="message"
                    className="textarea"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn--full"
                    disabled={saving}
                  >
                    <Save size={15} />

                    <span>
                      {saving
                        ? "Enregistrement..."
                        : "Enregistrer les Réglages"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </form>
        </section>

        <div className="side-stack">
          <section className="panel">
            <div className="preview-note-label">
              <Info size={15} />
              <span>Aperçu de la Note Client</span>
            </div>

            <div className="preview-note">
              <Info size={16} />

              <div>{message || "Le texte informatif apparaîtra ici..."}</div>
            </div>
          </section>

          <section className="panel info-card">
            <div className="panel-header">
              <div>
                <h2>Informations Espace</h2>

                <p>Repères pour l&apos;équipe.</p>
              </div>
            </div>

            <div className="info-rows">
              <div className="info-row">
                <span className="info-row-label">
                  <Wifi size={15} />
                  Wi-Fi Fibre
                </span>

                <span className="info-row-value info-row-value--accent">
                  GUITARA_COWORKING
                </span>
              </div>

              <div className="info-row">
                <span className="info-row-label">
                  <Clock size={15} />
                  Horaires
                </span>

                <span className="info-row-value">08:00 - 22:00</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
