import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin — Paighaam Wedding Cards",
  description: "Private admin panel for managing wedding card products.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
