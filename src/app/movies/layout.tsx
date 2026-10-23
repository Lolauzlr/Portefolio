import { moviesMetadata } from "@/lib/seo";

export const metadata = moviesMetadata;

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
