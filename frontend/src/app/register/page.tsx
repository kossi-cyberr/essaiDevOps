"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register, user, ready } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Les mots de passe ne correspondent pas." });
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError("Inscription impossible. Réessayez.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Quelques secondes suffisent pour commencer."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert message={error} />}

        <Input
          label="Nom d'utilisateur"
          autoComplete="username"
          placeholder="johndoe"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={fieldErrors.username}
          hint="3 à 50 caractères : lettres, chiffres, points, tirets."
          required
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            placeholder="6 caractères min."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            required
          />
          <Input
            label="Confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />
        </div>

        <Button type="submit" className="w-full" loading={submitting}>
          Créer mon compte
        </Button>
      </form>
    </AuthShell>
  );
}
