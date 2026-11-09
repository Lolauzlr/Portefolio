export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#15161b] text-white min-h-screen pt-[81px] md:pt-[140px] pb-[48px] md:pb-[80px] px-3 md:px-8 min-[85rem]:px-[120px]">
      <article className="max-w-3xl flex flex-col gap-[16px] font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] leading-relaxed [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:text-[24px] [&_h2]:tracking-[1.92px] [&_h2]:uppercase [&_h2]:mt-[16px] [&_a]:text-[#0fd1ea] [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-[24px]">
        <h1 className="font-[family-name:var(--font-heading)] text-[32px] md:text-[48px] tracking-[3.2px] uppercase">
          {title}
        </h1>
        <div className="bg-[#ddff6e] h-[4px] w-[80px]" />
        <p className="text-[#dadada]">Last updated: {updated}</p>
        {children}
      </article>
    </div>
  );
}
