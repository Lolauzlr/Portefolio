import type { Metadata } from "next";
import ShelfShell from "@/components/comics/ShelfShell";

export const metadata: Metadata = {
  title: "Récits dessinés | Marie Chalandre",
  description:
    "Les bandes dessinées de Marie Chalandre : Old Knight, No Finder et les récits en cours d'écriture.",
};

export default function ComicsLayout({ children }: LayoutProps<"/comics">) {
  return <ShelfShell>{children}</ShelfShell>;
}
