import { NavLink } from "@/types";
import { CATEGORY_LANDING } from "@/lib/categories";
import { getWhatsAppChatLink } from "@/lib/constants";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/#collection" },
  {
    label: "Contact",
    href: getWhatsAppChatLink("Hi Shahi Bulawa! I have a query and would like to get in touch. Can you help me?"),
    target: "_blank",
  },
];

export const categoryLinks: NavLink[] = CATEGORY_LANDING.map((c) => ({
  label: c.h1.replace(" in Karachi", ""),
  href: `/category/${c.slug}`,
}));
