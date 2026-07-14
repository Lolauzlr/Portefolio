import { asset } from "@/lib/asset";

const i = (n: number) => `/images/illustrations/illus-${n}.webp`;

const loremLong =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula. Ut sit amet vestibulum nulla. Sed at pellentesque mi, a varius massa. Praesent nec faucibus felis, in vestibulum dui. Nunc pulvinar ac purus vitae pellentesque. Vivamus dapibus semper justo, interdum tincidunt tellus placerat a. Quisque vel orci et nulla vestibulum interdum.";

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

function TitleBlock() {
  return (
    <div className="flex flex-col gap-[24px]">
      <SubTitle>UNE IDÉE DE TITRE</SubTitle>
      <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px] text-white">
        {loremLong}
      </p>
    </div>
  );
}

export default function IllustrationsPage() {
  return (
    <div className="pt-[95px] bg-[#15161b] text-white min-h-screen">

      {/* ── LES PLUS RÉCENTES ── */}
      <section className="py-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px] mb-[60px]">
          <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[60px] tracking-[4.8px] uppercase text-white">
            LES PLUS RÉCENTES
          </h2>
          <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-[4px]" />
        </div>

        {/* Horizontal scroll row — centered on desktop like Figma */}
        <div className="max-w-[1440px] mx-auto flex gap-[24px] overflow-x-auto px-4 pb-4 items-start scrollbar-hide md:justify-center md:overflow-x-visible md:px-[120px]">
          {/* ARCANE — title on top, image below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[303px]">
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">ARCANE</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.
              </p>
            </div>
            <img src={asset(i(1))} alt="Arcane" className="w-full h-[539px] object-cover" />
          </div>

          {/* MONSTER IN A BOTTLE — image on top, title below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[382px]">
            <img src={asset(i(2))} alt="Monster in a bottle" className="w-full h-[679px] object-cover" />
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">MONSTER IN A BOTTLE</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.
              </p>
            </div>
          </div>

          {/* MAZOU BD — title on top, image below */}
          <div className="flex-shrink-0 flex flex-col gap-[16px] w-[303px]">
            <div className="flex flex-col gap-[12px]">
              <p className="font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px]">MAZOU BD</p>
              <p className="font-[family-name:var(--font-body)] text-[16px] tracking-[1.28px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis mollis tortor. Sed id augue ligula.
              </p>
            </div>
            <img src={asset(i(3))} alt="Mazou BD" className="w-full h-[539px] object-cover" />
          </div>
        </div>
      </section>

      {/* ── VRIC À VRAC ── */}
      <section className="bg-[#131313] py-[60px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px] mb-[60px]">
          <h2 className="font-[family-name:var(--font-heading)] text-[40px] md:text-[60px] tracking-[4.8px] uppercase text-white">
            VRIC À VRAC
          </h2>
          <div className="w-[80px] h-[4px] bg-[#ddff6e] mt-[4px]" />
        </div>

        <div className="max-w-[1440px] mx-auto flex flex-col gap-[40px] px-4 md:px-[120px]">

          {/* Row 1: big left image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(4))} alt="" className="w-full h-[662px] object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <TitleBlock />
              <img src={asset(i(5))} alt="" className="w-full h-[322px] object-cover" />
            </div>
          </div>

          {/* Row 2: left col stacked (aspect + 322px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[40px]">
              <img src={asset(i(6))} alt="" className="w-full aspect-[1548/1473] object-cover" />
              <img src={asset(i(7))} alt="" className="w-full h-[322px] object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(8))} alt="" className="w-full h-[810px] object-cover" />
            </div>
          </div>

          {/* Row 3: left col (title/text top, 322px image bottom) + right image */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6">
              <TitleBlock />
              <img src={asset(i(9))} alt="" className="w-full h-[322px] object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(10))} alt="" className="w-full h-[662px] object-cover" />
            </div>
          </div>

          {/* Row 4: single full-width image */}
          <div>
            <img src={asset(i(11))} alt="" className="w-full h-[607px] object-cover" />
          </div>

          {/* Row 5: left col stacked + right tall */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[40px]">
              <img src={asset(i(12))} alt="" className="w-full aspect-[1548/1473] object-cover" />
              <img src={asset(i(13))} alt="" className="w-full h-[322px] object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(14))} alt="" className="w-full h-[810px] object-cover" />
            </div>
          </div>

          {/* Row 6: left tall image (674px) + right col (title/text top, aspect image bottom) */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[56%] shrink-0">
              <img src={asset(i(15))} alt="" className="w-full h-[930px] object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <TitleBlock />
              <img src={asset(i(16))} alt="" className="w-full aspect-[1548/1473] object-cover" />
            </div>
          </div>

          {/* Row 7: left col (2×322px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[40px]">
              <img src={asset(i(17))} alt="" className="w-full h-[322px] object-cover" />
              <img src={asset(i(18))} alt="" className="w-full h-[322px] object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(19))} alt="" className="w-full h-[810px] object-cover" />
            </div>
          </div>

          {/* Row 8: 3 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            <img src={asset(i(20))} alt="" className="w-full h-[682px] object-cover" />
            <img src={asset(i(21))} alt="" className="w-full h-[682px] object-cover" />
            <img src={asset(i(22))} alt="" className="w-full h-[682px] object-cover" />
          </div>

          {/* Row 9: left col (title/text top, image bottom) + right col (2 stacked images) */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="flex-1 flex flex-col gap-6">
              <TitleBlock />
              <img src={asset(i(23))} alt="" className="w-full h-[350px] object-cover" />
            </div>
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[4px]">
              <img src={asset(i(24))} alt="" className="w-full h-[275px] object-cover" />
              <img src={asset(i(25))} alt="" className="w-full h-[275px] object-cover" />
            </div>
          </div>

          {/* Row 10: left col (3×264px) + right tall */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0 flex flex-col gap-[12px]">
              <img src={asset(i(26))} alt="" className="w-full h-[264px] object-cover" />
              <img src={asset(i(27))} alt="" className="w-full h-[264px] object-cover" />
              <img src={asset(i(28))} alt="" className="w-full h-[264px] object-cover" />
            </div>
            <div className="flex-1">
              <img src={asset(i(29))} alt="" className="w-full h-[810px] object-cover" />
            </div>
          </div>

          {/* Row 11: 2 equal columns, object-contain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
            <img src={asset(i(30))} alt="" className="w-full h-[764px] object-contain" />
            <img src={asset(i(31))} alt="" className="w-full h-[764px] object-contain" />
          </div>

          {/* Row 12: left image + right col (title/text top, image bottom) */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(32))} alt="" className="w-full h-[662px] object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <TitleBlock />
              <img src={asset(i(33))} alt="" className="w-full h-[322px] object-cover" />
            </div>
          </div>

          {/* Row 13: 2 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
            <img src={asset(i(34))} alt="" className="w-full h-[1031px] object-cover" />
            <img src={asset(i(35))} alt="" className="w-full h-[1031px] object-cover" />
          </div>

          {/* Row 14: left square image + right col (title/text) */}
          <div className="flex flex-col md:flex-row gap-[40px] items-start">
            <div className="w-full md:w-[44%] shrink-0">
              <img src={asset(i(36))} alt="" className="w-full h-[572px] object-cover" />
            </div>
            <div className="flex-1">
              <TitleBlock />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
