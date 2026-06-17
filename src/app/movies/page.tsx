import { asset } from "@/lib/asset";

export default function MoviesPage() {
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.";

  const documentaries = [
    {
      src: "/images/movies_louvre.png",
      title: "IL ETAIT UNE FOIS LE MUSEE DU LOUVRE",
      reversed: false,
    },
    {
      src: "/images/movies_jerry.png",
      title: "JERRY GRETZINGER",
      reversed: true,
    },
    {
      src: "/images/movies_fauve.png",
      title: "FAUVE",
      reversed: false,
    },
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Features Films */}
      <section className="px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-[4.8px] mb-2">
          FEATURES FILMS
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <img
          src={asset("/images/movies_saintex.png")}
          alt="Saint Ex"
          className="w-full h-[675px] object-cover"
        />
        <h3 className="text-[28px] font-[var(--font-heading)] tracking-[2.24px] mt-6 mb-2">
          SAINT EX
        </h3>
        <div className="w-[80px] h-[4px] bg-white mb-4" />
        <p className="text-base font-[var(--font-body)] tracking-[1.28px] max-w-3xl">
          {loremIpsum}
        </p>
      </section>

      {/* Documentary */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-[4.8px] mb-2">
          DOCUMENTARY
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col gap-12">
          {documentaries.map((doc) => (
            <div
              key={doc.title}
              className={`flex flex-col md:flex-row gap-8 items-center ${
                doc.reversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <img
                src={asset(doc.src)}
                alt={doc.title}
                className="w-full md:w-[792px] h-auto object-cover flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-[28px] font-[var(--font-heading)] tracking-[2.24px] mb-2">
                  {doc.title}
                </h3>
                <div className="w-[80px] h-[4px] bg-white mb-4" />
                <p className="text-base font-[var(--font-body)] tracking-[1.28px]">
                  {loremIpsum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
