export default function StoryboardPage() {
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.";

  const projects = [
    {
      title: "SHORTFILM",
      src: "/images/storyboard_shortfilm.png",
      src2: "/images/storyboard_shortfilm2.png",
      reversed: false,
    },
    {
      title: "CLIP VIDÉO",
      src: "/images/storyboard_clip.png",
      reversed: true,
    },
    {
      title: "LA SCÈNE",
      src: "/images/storyboard_scene.png",
      src2: "/images/storyboard_scene2.png",
      reversed: false,
    },
    {
      title: "CLIP NABIL HARLOW - C'EST PAS VRAI",
      src: "/images/storyboard_nabil.png",
      reversed: true,
    },
  ];

  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">
      {/* Le Plus Récent */}
      <section className="px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-widest mb-2">
          LE PLUS RÉCENT
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <img
          src="/images/storyboard_recent.png"
          alt="Musique Clip"
          className="w-full h-[675px] object-cover"
        />
        <h3 className="text-[28px] font-[var(--font-heading)] tracking-widest mt-6 mb-2">
          MUSIQUE CLIP
        </h3>
        <div className="w-[60px] h-[3px] bg-white mb-4" />
        <p className="text-base font-[var(--font-body)] tracking-[1.28px] max-w-3xl">
          {loremIpsum}
        </p>
      </section>

      {/* Tous Mes Travaux */}
      <section className="bg-[#131313] px-4 md:px-[120px] py-16">
        <h2 className="text-[40px] md:text-[60px] font-[var(--font-heading)] tracking-widest mb-2">
          TOUS MES TRAVAUX
        </h2>
        <div className="w-[80px] h-[4px] bg-[#ddff6e] mb-10" />
        <div className="flex flex-col gap-12">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`flex flex-col md:flex-row gap-8 items-start ${
                project.reversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <img
                src={project.src}
                alt={project.title}
                className="w-full md:w-[792px] h-auto object-cover flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-[28px] font-[var(--font-heading)] tracking-widest mb-2">
                  {project.title}
                </h3>
                <div className="w-[60px] h-[3px] bg-white mb-4" />
                <p className="text-base font-[var(--font-body)] tracking-[1.28px]">
                  {loremIpsum}
                </p>
                {project.src2 && (
                  <img
                    src={project.src2}
                    alt={`${project.title} additional`}
                    className="w-full h-auto object-cover mt-6"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
