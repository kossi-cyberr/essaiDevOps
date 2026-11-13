import { cn } from "@/lib/utils";

export default function Alert({
  message,
  variant = "error",
  className,
}: {
  message: string;
  variant?: "error" | "success" | "info";
  className?: string;
}) {
  const variants = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  } as const;

  return (
    <div
      role="alert"
      className={cn("rounded-xl border px-3.5 py-3 text-sm", variants[variant], className)}
    >
      {message}
    </div>
  );
}
