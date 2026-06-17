export default function IllustrationsPage() {
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.";

  const featured = [
    { src: "/images/illus_arcane.png", title: "ARCANE", w: 303, h: 539 },
    { src: "/images/illus_monster.png", title: "MONSTER IN A BOTTLE", w: 382, h: 679 },
    { src: "/images/illus_mazou.png", title: "MAZOU BD", w: 303, h: 539 },
  ];

  const galleryRows: string[][] = [
    ["/images/illus_01.png", "/images/illus_02.png", "/images/illus_03.png"],
    ["/images/illus_04.png", "/images/illus_05.png"],
    ["/images/illus_06.png", "/images/illus_07.png", "/images/illus_08.png"],
    ["/images/illus_09.png", "/images/illus_10.png"],
    ["/images/illus_11.png", "/images/illus_12.png", "/images/illus_13.png"],
    ["/images/illus_14.png", "/images/illus_15.png"],
    ["/images/illus_16.png", "/images/illus_17.png", "/images/illus_18.png"],
    ["/images/illus_19.png", "/images/illus_20.png"],
    ["/images/illus_21.png", "/images/illus_22.png", "/images/illus_23.png"],
    ["/images/illus_24.png", "/images/illus_25.png", "/images/illus_26.png", "/images/illus_27.png"],
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Les Plus Récentes */}
      <section className="px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-widest mb-2">
          LES PLUS RÉCENTES
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col md:flex-row justify-center items-end gap-6">
          {featured.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <img
                src={item.src}
                alt={item.title}
                className="object-cover"
                style={{ width: item.w, height: item.h }}
              />
              <p className="mt-3 text-[28px] font-[var(--font-heading)] tracking-widest text-center">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vric à Vrac */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-widest mb-2">
          VRIC À VRAC
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />

        {/* Main feature row */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <img
            src="/images/illus_main.png"
            alt="Main illustration"
            className="w-full md:w-1/2 h-auto object-cover"
          />
          <div className="flex flex-col justify-between md:w-1/2">
            <div>
              <h3 className="text-[28px] font-[var(--font-heading)] tracking-widest mb-2">
                UNE IDÉE DE TITRE
              </h3>
              <div className="w-[60px] h-[3px] bg-white mb-4" />
              <p className="text-base font-[var(--font-body)] tracking-[1.28px]">
                {loremIpsum}
              </p>
            </div>
            <img
              src="/images/illus_dragon.png"
              alt="Dragon illustration"
              className="w-full h-auto object-cover mt-6"
            />
          </div>
        </div>

        {/* Gallery grid rows */}
        {galleryRows.map((row, rowIdx) => (
          <div key={rowIdx}>
            {rowIdx === 3 || rowIdx === 7 ? (
              <div className="my-8">
                <h3 className="text-[28px] font-[var(--font-heading)] tracking-widest mb-2">
                  UNE IDÉE DE TITRE
                </h3>
                <div className="w-[60px] h-[3px] bg-white mb-4" />
              </div>
            ) : null}
            <div
              className={`grid gap-4 mb-4 ${
                row.length === 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : row.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {row.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="w-full h-auto object-cover"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
