import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Taskly — Gestion de tâches",
  description: "Organisez vos tâches simplement : créez, suivez et terminez vos journées.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-background min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
