import { NavLink } from "@/types";
import { CATEGORY_LANDING } from "@/lib/categories";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "#collection" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const categoryLinks: NavLink[] = CATEGORY_LANDING.map((c) => ({
  label: c.h1.replace(" in Karachi", ""),
  href: `/category/${c.slug}`,
}));
