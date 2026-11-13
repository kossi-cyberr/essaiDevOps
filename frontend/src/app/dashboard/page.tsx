"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TaskCard from "@/components/TaskCard";
import TaskFilters from "@/components/TaskFilters";
import TaskForm, { type TaskFormValues } from "@/components/TaskForm";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { ApiError, tasksApi } from "@/lib/api";
import type { Task, TaskFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await tasksApi.list("all"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger vos tâches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const counts = useMemo<Record<TaskFilter, number>>(
    () => ({ all: tasks.length, active: activeCount, completed: completedCount }),
    [tasks.length, activeCount, completedCount]
  );

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  async function handleCreate(values: TaskFormValues) {
    const created = await tasksApi.create({
      title: values.title,
      description: values.description || null,
    });
    setTasks((previous) => [created, ...previous]);
  }

  /** Mise à jour optimiste : l'interface réagit immédiatement, puis se resynchronise. */
  async function handleToggle(task: Task) {
    setBusyId(task.id);
    setError(null);
    setTasks((previous) =>
      previous.map((item) => (item.id === task.id ? { ...item, completed: !item.completed } : item))
    );

    try {
      const updated = await tasksApi.toggle(task.id);
      setTasks((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setTasks((previous) => previous.map((item) => (item.id === task.id ? task : item)));
      setError(err instanceof ApiError ? err.message : "Impossible de mettre à jour la tâche.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleEdit(values: TaskFormValues) {
    if (!editingTask) return;

    const updated = await tasksApi.update(editingTask.id, {
      title: values.title,
      description: values.description || null,
      completed: editingTask.completed,
    });

    setTasks((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    setEditingTask(null);
  }

  async function handleDelete() {
    if (!deletingTask) return;

    setDeleting(true);
    setError(null);
    try {
      await tasksApi.remove(deletingTask.id);
      setTasks((previous) => previous.filter((item) => item.id !== deletingTask.id));
      setDeletingTask(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer la tâche.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Bonjour, {user?.username} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeCount === 0 && tasks.length > 0
              ? "Tout est terminé. Profitez-en !"
              : `${activeCount} tâche${activeCount > 1 ? "s" : ""} en cours sur ${tasks.length}.`}
          </p>
        </div>

        {/* Résumé / progression */}
        <section
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:grid-cols-3"
          aria-label="Résumé"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{tasks.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">En cours</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-600">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Terminées</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600">{completedCount}</p>
          </div>
          <div className="sm:col-span-3">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Progression</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Création */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Nouvelle tâche
          </h2>
          <TaskForm submitLabel="Ajouter la tâche" onSubmit={handleCreate} />
        </section>

        {error && <Alert message={error} className="mb-4" />}

        {/* Liste */}
        <section className="space-y-4" aria-label="Liste des tâches">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mes tâches</h2>
            <TaskFilters value={filter} counts={counts} onChange={setFilter} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-sm text-slate-500">
              <Spinner className="h-5 w-5 text-brand-600" />
              Chargement de vos tâches…
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {tasks.length === 0
                  ? "Aucune tâche pour le moment."
                  : filter === "active"
                    ? "Aucune tâche en cours. Beau travail !"
                    : "Aucune tâche terminée pour l'instant."}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tasks.length === 0
                  ? "Ajoutez votre première tâche avec le formulaire ci-dessus."
                  : "Changez de filtre pour voir vos autres tâches."}
              </p>
            </div>
          ) : (
            <ul className={cn("space-y-2.5")}>
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  busy={busyId === task.id}
                  onToggle={handleToggle}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Modification */}
      <Modal
        open={editingTask !== null}
        title="Modifier la tâche"
        description="Mettez à jour le titre ou la description."
        onClose={() => setEditingTask(null)}
      >
        {editingTask && (
          <TaskForm
            initialValues={{
              title: editingTask.title,
              description: editingTask.description ?? "",
            }}
            submitLabel="Enregistrer"
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
            autoFocus
          />
        )}
      </Modal>

      {/* Suppression */}
      <Modal
        open={deletingTask !== null}
        title="Supprimer la tâche ?"
        description="Cette action est définitive."
        onClose={() => (deleting ? undefined : setDeletingTask(null))}
        className="max-w-md"
      >
        <p className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          « {deletingTask?.title} »
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingTask(null)} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
