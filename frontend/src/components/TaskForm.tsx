"use client";

import { useState, type FormEvent } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api";

export interface TaskFormValues {
  title: string;
  description: string;
}

interface TaskFormProps {
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}

/**
 * Formulaire contrôlé, réutilisé pour la création et la modification d'une tâche.
 * La gestion du chargement et des erreurs de validation est internalisée.
 */
export default function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldError("Le titre est obligatoire.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: trimmedTitle, description: description.trim() });
      // Réinitialise le formulaire de création après succès.
      if (!initialValues) {
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldError(err.fieldErrors?.title ?? null);
      } else {
        setError("L'enregistrement a échoué. Réessayez.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      {error && <Alert message={error} />}

      <Input
        label="Titre"
        placeholder="Que devez-vous faire ?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldError ?? undefined}
        maxLength={150}
        autoFocus={autoFocus}
        required
      />

      <Textarea
        label="Description (optionnelle)"
        placeholder="Ajoutez quelques détails…"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        maxLength={2000}
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
