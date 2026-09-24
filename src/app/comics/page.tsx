import ShelfFallback from "@/components/comics/ShelfFallback";

export default function ComicsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-[152px] pb-24 md:px-[120px]">
      <h1 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[4.8px] uppercase md:text-[60px]">
        Récits dessinés
      </h1>
      <div className="mt-2 mb-10 h-[4px] w-[80px] bg-[#ddff6e]" />
      <ShelfFallback />
    </div>
  );
}
