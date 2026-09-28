import { asset } from "@/lib/asset";

const i = (n: number) => `/images/illustrations/illus-${n}.webp`;
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
                  <img src={asset(slide.src)} alt={slide.alt} className="absolute inset-0 w-full h-full object-cover" />
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
            <img src={asset(i(25))} alt="Arcane" className="w-full h-[539px] object-cover" />
          </div>

          {/* MONSTER IN A BOTTLE — image on top, title below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[382px]">
            <img src={asset(i(34))} alt="Drunked Monster" className="w-full h-[679px] object-cover" />
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
            <img src={asset(i(32))} alt="Mazou BD" className="w-full h-[539px] object-cover" />
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
              <img src={asset(i(35))} alt="" className="w-full md:aspect-auto md:h-[662px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Cinematic Approach to Illustration"
                text="My background in cinematic art still comes through in the way I approach illustration. I pay a lot of attention to composition, color, light and rhythm, even in a single frame. For me, visual storytelling is about creating an image that can communicate something without saying a word."
              />
              <img src={asset(i(1))} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
          </div>

          {/* Row 2: left col stacked (aspect + 322px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px]">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[24px] md:gap-[40px]">
              <img src={asset(i(16))} alt="" className="w-full md:aspect-[1548/1473] md:object-cover" />
              <img src={asset(i(26))} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(30))} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 3: left col (title/text top, 322px image bottom) + right image */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Versatility in Illustration"
                text="I enjoy moving between different artistic styles and ways of working. My visual style can change quite a lot depending on the project, and I see that versatility as a useful part of the process. It gives me more ways to adapt an image to the story and find the right direction."
              />
              <img src={asset(i(6))} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(33))} alt="" className="w-full md:aspect-auto md:h-[662px] md:object-cover" />
            </div>
          </div>

          {/* Row 4: single full-width image */}
          <div>
            <img src={asset(i(10))} alt="" className="w-full md:aspect-auto md:h-[607px] md:object-cover" />
          </div>

          {/* Row 5: left col stacked + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] md:items-stretch">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[24px] md:gap-[40px] md:self-stretch">
              <img src={asset(i(23))} alt="" className="w-full md:flex-1 md:aspect-auto md:object-cover" />
              <img src={asset(i(13))} alt="" className="w-full md:aspect-auto md:h-[322px] md:object-cover" />
            </div>
            <div className="flex-1 md:self-stretch">
              <img src={asset(i(15))} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 6: left tall image (930px) + right col (title/text top, aspect image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[56%] shrink-0">
              <img src={asset(i(27))} alt="" className="w-full md:aspect-auto md:h-[930px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Traditional & Digital Techniques"
                text="I switch between traditional and digital techniques depending on what I want to express. Sometimes it is watercolor and ink, sometimes pencil and pen, sometimes digital painting in Photoshop. I like not being locked into one way of working and letting the technique adapt to the idea."
              />
              <img src={asset(i(14))} alt="" className="w-full md:aspect-[1548/1473] md:object-cover" />
            </div>
          </div>

          {/* Row 7: 3 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[24px]">
            <img src={asset(i(18))} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
            <img src={asset(i(8))} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
            <img src={asset(i(3))} alt="" className="w-full md:aspect-auto md:h-[682px] md:object-cover" />
          </div>

          {/* Row 8: left col (title/text top, image bottom) + right single image */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Visual Development & Character Design"
                text="Some days I am designing a character, other days I am sketching a comic panel or working on an environment concept. I tend to have ideas for all kinds of things, so I enjoy moving between different formats and exploring where each one can take me. It keeps my visual development varied and my curiosity moving."
              />
              <img src={asset(i(5))} alt="" className="w-full md:aspect-auto md:h-[350px] md:object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(11))} alt="" className="w-full aspect-[2958/3389] md:aspect-auto md:h-[554px] object-contain" />
            </div>
          </div>

          {/* Row 9: left col (3×264px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px]">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[12px]">
              <img src={asset(i(22))} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <img src={asset(i(4))} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <img src={asset(i(2))} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
              <img src={asset(i(24))} alt="" className="w-full md:aspect-auto md:h-[264px] md:object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(28))} alt="" className="w-full md:aspect-auto md:h-full md:object-cover" />
            </div>
          </div>

          {/* Row 10: left image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 md:self-stretch">
              <img src={asset(i(36))} alt="" className="w-full md:aspect-auto md:h-[670px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Color, Light & Composition"
                text="I pay a lot of attention to color and lighting when I work. A change in palette, contrast or light can completely change the mood of an image. I like using these elements as part of the visual language, not just to make an image look good, but to reinforce its meaning."
              />
              <img src={asset(i(21))} alt="" className="w-full md:aspect-auto md:h-[500px] md:object-cover" />
            </div>
          </div>

          {/* Row 11: 2 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[40px]">
            <img src={asset(i(9))} alt="" className="w-full md:aspect-auto md:h-[1031px] md:object-cover" />
            <img src={asset(i(29))} alt="" className="w-full md:aspect-auto md:h-[1031px] md:object-cover" />
          </div>

          {/* Row 12: left square image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[24px] md:gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(laitiere)} alt="" className="w-full md:aspect-auto md:h-[572px] md:object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6 md:gap-0 md:justify-between md:self-stretch">
              <TitleBlock
                title="Inspiration from Around the World"
                text="Travel has always been a big source of inspiration for me. I have travelled around the world and developed a strong curiosity for different cultures, their art, folklore, history and ways of seeing the world. I draw inspiration from all sorts of places, from dance and cinema to manga, embroidery, video games, sculpture, photography and other things. I like bringing these different influences together and seeing how they find their way into my work."
              />
              <img src={asset(i(7))} alt="" className="w-full md:aspect-auto md:h-[350px] md:object-cover" />
            </div>
          </div>

          {/* Row 13: 2 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[40px]">
            <img src={asset(i(12))} alt="" className="w-full md:aspect-auto md:h-[960px] md:object-cover" />
            <img src={asset(i(31))} alt="" className="w-full aspect-[1075/1483] md:aspect-auto md:h-[960px] object-contain" />
          </div>

        </div>
      </section>
    </div>
  );
}
