import { LightboxImg, LightboxProvider, type LightboxSlide } from "@/components/IllustrationLightbox";

const i = (n: number) => `/images/illustrations/illus-${n}.webp`;
const purpleSmile = "/images/illustrations/couverture-album-purple-smile.webp";
const poissons = "/images/illustrations/illustration-homme-assit-dans-une-main-fond-ciel-avec-des-poissons.webp";
const dormeur = "/images/illustrations/illustration-homme-qui-dort-sur-le-sol.webp";
const laitiere = "/images/illustrations/reproduction-tableau-la-laitière-photoshop.webp";

const heroSlides: { src: string; alt: string; title: string; description: React.ReactNode }[] = [
  { src: i(25), alt: "Arcane", title: "ARCANE", description: "Digital Painting • Adobe Photoshop" },
  {
    src: i(34),
    alt: "Drunked Monster",
    title: "DRUNKED MONSTER",
    description: "Illustration : Cyril Mornet / Digital Painting : Marie Chalandre",
  },
  {
    src: i(32),
    alt: "Mazou BD",
    title: "MAZOU BD",
    description: (
      <>
        Comic Book Project • A visual diary of a journey around the world
        <br />
        Pen drawing on paper, digitally colored in Adobe Photoshop
      </>
    ),
  },
];

const lightboxSlides: LightboxSlide[] = [
  { src: i(25), alt: "Arcane" },
  { src: i(34), alt: "Drunked Monster" },
  { src: i(32), alt: "Mazou BD" },
  { src: i(35), alt: "" },
  { src: i(1), alt: "" },
  { src: i(16), alt: "" },
  { src: i(26), alt: "" },
  { src: i(30), alt: "" },
  { src: i(6), alt: "" },
  { src: i(33), alt: "" },
  { src: i(10), alt: "" },
  { src: i(23), alt: "" },
  { src: i(13), alt: "" },
  { src: i(15), alt: "" },
  { src: i(27), alt: "" },
  { src: i(14), alt: "" },
  { src: i(18), alt: "" },
  { src: i(8), alt: "" },
  { src: i(3), alt: "" },
  { src: i(5), alt: "" },
  { src: poissons, alt: "" },
  { src: i(22), alt: "" },
  { src: i(4), alt: "" },
  { src: i(2), alt: "" },
  { src: i(24), alt: "" },
  { src: i(28), alt: "" },
  { src: i(36), alt: "" },
  { src: i(21), alt: "" },
  { src: i(9), alt: "" },
  { src: i(29), alt: "" },
  { src: laitiere, alt: "" },
  { src: i(7), alt: "" },
  { src: i(12), alt: "" },
  { src: i(31), alt: "" },
  { src: dormeur, alt: "" },
  { src: purpleSmile, alt: "" },
  { src: i(11), alt: "" },
];

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <h3 className="font-[family-name:var(--font-heading)] text-[28px] tracking-[2.24px] text-white">
        {children}
      </h3>
      <div className="w-[80px] h-[4px] bg-white" />
    </div>
  );
}

function TitleBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-[16px] md:gap-[24px]">
      <SubTitle>{title}</SubTitle>
      <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
        {text}
      </p>
    </div>
  );
}

export default function IllustrationsPage() {
  return (
    <LightboxProvider slides={lightboxSlides}>
    <div className="pt-[48px] md:pt-[95px] bg-[#15161b] text-white min-h-screen">

      {/* ── LES PLUS RÉCENTES ── */}
      <section className="pt-[24px] pb-[24px] md:pt-[60px] md:pb-[60px]">

        {/* Mobile: swipeable carousel, caption overlaid on each image */}
        <div className="md:hidden flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[4px] px-[16px]">
            <h2 className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-white">
              LES PLUS RÉCENTES
            </h2>
            <div className="w-[80px] h-[4px] bg-[#ddff6e]" />
          </div>

          <div className="flex gap-[24px] overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide cursor-pointer px-[16px]">
            {heroSlides.map((slide, index) => (
              <div key={slide.title} className="flex-shrink-0 w-[calc(100vw-32px)] snap-center flex flex-col gap-[16px]">
                <div className="relative w-full aspect-[9/16]">
                  <LightboxImg src={slide.src} alt={slide.alt} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute left-[12px] right-[12px] bottom-[12px] backdrop-blur-[5px] bg-black/40 p-[8px] flex flex-col gap-[8px]">
                    <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] text-white">
                      {slide.title}
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-[14px] tracking-[1.12px] text-white">
                      {slide.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-[4px] items-center justify-center">
                  {heroSlides.map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`h-[6px] w-[20px] ${dotIndex === index ? "bg-[#0fd1ea]" : "bg-[#555]"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: side-by-side layout, title/text alongside image */}
        <div className="hidden md:flex gap-[24px] overflow-x-auto pb-4 items-start scrollbar-hide mx-auto w-fit px-[120px]">
          {/* ARCANE — title on top, image below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[303px]">
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">ARCANE</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Digital Painting • Adobe Photoshop
              </p>
            </div>
            <LightboxImg src={i(25)} alt="Arcane" className="w-full h-[539px] object-cover" />
          </div>

          {/* MONSTER IN A BOTTLE — image on top, title below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[382px]">
            <LightboxImg src={i(34)} alt="Drunked Monster" className="w-full h-[679px] object-cover" />
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">DRUNKED MONSTER</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Illustration : Cyril Mornet / Digital Painting : Marie Chalandre
              </p>
            </div>
          </div>

          {/* MAZOU BD — title on top, image below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[303px]">
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">MAZOU BD</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Comic Book Project • A visual diary of a journey around the world
                <br />
                Pen drawing on paper, digitally colored in Adobe Photoshop
              </p>
            </div>
            <LightboxImg src={i(32)} alt="Mazou BD" className="w-full h-[539px] object-cover" />
          </div>
        </div>
      </section>

      {/* ── ILLUSTRATION & VISUAL EXPLORATION ── */}
      <section className="bg-[#131313] pt-[24px] pb-[24px] md:py-[60px] px-3 md:px-[120px]">
        <div className="mb-[24px] md:mb-[60px]">
          <h2 className="font-[family-name:var(--font-heading)] text-[40px] tracking-[4.8px] uppercase text-white">
            Illustration & visual exploration
          </h2>
          <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-[4px]" />
        </div>

        <div className="flex flex-col gap-[24px] md:gap-[40px]">

          {/* Row 1: big left image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <LightboxImg src={i(35)} alt="" className="w-full md:aspect-auto md:h-[662px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Cinematic Approach to Illustration"
                text="My background in cinematic art still comes through in the way I approach illustration. I pay a lot of attention to composition, color, light and rhythm, even in a single frame. For me, visual storytelling is about creating an image that can communicate something without saying a word."
              />
              <LightboxImg src={i(1)} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
          </div>

          {/* Row 2: left col stacked (aspect + 322px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px]">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[24px] md:gap-[40px]">
              <LightboxImg src={i(16)} alt="" className="w-full md:aspect-[1548/1473] md:object-cover" />
              <LightboxImg src={i(26)} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="flex-1">
              <LightboxImg src={i(30)} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 3: left col (title/text top, 322px image bottom) + right image */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Versatility in Illustration"
                text="I enjoy moving between different artistic styles and ways of working. My visual style can change quite a lot depending on the project, and I see that versatility as a useful part of the process. It gives me more ways to adapt an image to the story and find the right direction."
              />
              <LightboxImg src={i(6)} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0">
              <LightboxImg src={i(33)} alt="" className="w-full md:aspect-auto md:h-[662px] md:object-cover" />
            </div>
          </div>

          {/* Row 4: single full-width image */}
          <div>
            <LightboxImg src={i(10)} alt="" className="w-full md:aspect-auto md:h-[607px] md:object-cover" />
          </div>

          {/* Row 5: left col stacked + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] md:items-stretch">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[24px] md:gap-[40px] md:self-stretch">
              <LightboxImg src={i(23)} alt="" className="w-full md:flex-1 md:aspect-auto md:object-cover" />
              <LightboxImg src={i(13)} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="flex-1 md:self-stretch">
              <LightboxImg src={i(15)} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 6: left tall image (930px) + right col (title/text top, aspect image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[56%] shrink-0">
              <LightboxImg src={i(27)} alt="" className="w-full md:aspect-auto md:h-[930px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Traditional & Digital Techniques"
                text="I switch between traditional and digital techniques depending on what I want to express. Sometimes it is watercolor and ink, sometimes pencil and pen, sometimes digital painting in Photoshop. I like not being locked into one way of working and letting the technique adapt to the idea."
              />
              <LightboxImg src={i(14)} alt="" className="w-full md:aspect-[1548/1473] md:object-cover" />
            </div>
          </div>

          {/* Row 7: 3 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[24px]">
            <LightboxImg src={i(18)} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
            <LightboxImg src={i(8)} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
            <LightboxImg src={i(3)} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
          </div>

          {/* Row 8: left col (title/text top, image bottom) + right single image */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Visual Development & Character Design"
                text="Some days I am designing a character, other days I am sketching a comic panel or working on an environment concept. I tend to have ideas for all kinds of things, so I enjoy moving between different formats and exploring where each one can take me. It keeps my visual development varied and my curiosity moving."
              />
              <LightboxImg src={i(5)} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0">
              <LightboxImg src={poissons} alt="" className="w-full aspect-[3285/4652]" />
            </div>
          </div>

          {/* Row 9: left col (3×264px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px]">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[12px]">
              <LightboxImg src={i(22)} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <LightboxImg src={i(4)} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <LightboxImg src={i(2)} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <LightboxImg src={i(24)} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
            </div>
            <div className="flex-1">
              <LightboxImg src={i(28)} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 10: left image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 md:self-stretch">
              <LightboxImg src={i(36)} alt="" className="w-full md:aspect-auto md:h-[670px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Color, Light & Composition"
                text="I pay a lot of attention to color and lighting when I work. A change in palette, contrast or light can completely change the mood of an image. I like using these elements as part of the visual language, not just to make an image look good, but to reinforce its meaning."
              />
              <LightboxImg src={i(21)} alt="" className="w-full md:aspect-auto md:h-[500px] md:object-cover" />
            </div>
          </div>

          {/* Row 11: 2 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[40px]">
            <LightboxImg src={i(9)} alt="" className="w-full md:aspect-auto md:h-[1031px] md:object-cover" />
            <LightboxImg src={i(29)} alt="" className="w-full md:aspect-auto md:h-[1031px] md:object-cover" />
          </div>

          {/* Row 12: left square image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <LightboxImg src={laitiere} alt="" className="w-full md:aspect-auto md:h-[572px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Inspiration from Around the World"
                text="Travel has always been a big source of inspiration for me. I have travelled around the world and developed a strong curiosity for different cultures, their art, folklore, history and ways of seeing the world. I draw inspiration from all sorts of places, from dance and cinema to manga, embroidery, video games, sculpture, photography and other things. I like bringing these different influences together and seeing how they find their way into my work."
              />
              <LightboxImg src={i(7)} alt="" className="w-full md:aspect-auto md:h-[350px] md:object-cover" />
            </div>
          </div>

          {/* Row 13: 2 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[40px]">
            <LightboxImg src={i(12)} alt="" className="w-full md:aspect-auto md:h-[960px] md:object-cover" />
            <LightboxImg src={i(31)} alt="" className="w-full aspect-[1075/1483] md:aspect-auto md:h-[960px] object-contain" />
          </div>

          {/* Row 14: single full-width image, natural ratio */}
          <div>
            <LightboxImg src={dormeur} alt="" className="w-full" />
          </div>

          {/* Row 15: same height on desktop. Each column's flex-grow is its own
              width/height ratio (2958/3389 ≈ 873, 7850/7874 ≈ 997), so both images share one height and are
              scaled proportionally, never cropped or stretched. */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px]">
            <div className="w-full md:w-auto md:min-w-0 md:[flex:997_997_0%]">
              <LightboxImg src={purpleSmile} alt="" className="w-full aspect-[7850/7874] block" />
            </div>
            <div className="w-full md:w-auto md:min-w-0 md:[flex:873_873_0%]">
              <LightboxImg src={i(11)} alt="" className="w-full aspect-[2958/3389] block" />
            </div>
          </div>

        </div>
      </section>
    </div>
    </LightboxProvider>
  );
}
