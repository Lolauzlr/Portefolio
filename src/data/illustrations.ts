// Short description shown under each illustration in the lightbox, keyed by
// file name (the same image has the same caption on the Home and on the
// Illustrations page).
const captions: Record<string, string> = {
  "illus-35.webp": "2D Illustration • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-3.webp": "Illustration for a comic book project, in collaboration with theater director Marc Granier. • Composition, Traditional Drawing & Digital Coloring in Adobe Photoshop",
  "illus-4.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-5.webp": "Comic book project • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-25.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-36.webp": "Digital Painting • Adobe Photoshop",
  "illus-1.webp": "Digital Painting • Adobe Photoshop",
  "illus-7.webp": "Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-6.webp": "Digital Painting in Adobe Photoshop",
  "illus-2.webp": "Concept Art for a short film • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-16.webp": "Digital Painting in Adobe Photoshop",
  "illus-30.webp": "Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-26.webp": "Digital Painting in Adobe Photoshop",
  "illus-33.webp": "Digital Painting in Adobe Photoshop",
  "illus-10.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-13.webp": "Digital Painting in Adobe Photoshop",
  "illus-23.webp": "Comic book project • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-27.webp": "Concept Art for a short film • Pastel on paper and digital color treatment in Adobe Photoshop",
  "illus-15.webp": "Digital Painting in Adobe Photoshop",
  "illus-24.webp": "Traditional ink drawing and digital color treatment in Adobe Photoshop",
  "illus-18.webp": "Digital Painting in Adobe Photoshop",
  "illus-8.webp": "Illustration created for BPM Theater Company, for Marc Granier’s play Frantz • Digital Painting in Adobe Photoshop",
  "illus-11.webp": "Screen printing on paper",
  "illus-12.webp": "Screen printing on paper",
  "illus-22.webp": "Disney Art Challenge submission • Pencil on paper with digital coloring in Adobe Photoshop",
  "illus-28.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-21.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-9.webp": "Digital Painting in Adobe Photoshop",
  "illus-29.webp": "Illustration created for BPM Theater Company, for Marc Granier’s play Frantz • Digital Painting in Adobe Photoshop",
  "illus-31.webp": "Digital Painting : Marie Chalandre • Illustration : Cyril Mornet",
  "illus-34.webp": "Digital Painting : Marie Chalandre • Illustration : Cyril Mornet",
  "illus-32.webp": "Comic Book Project • A visual diary of a journey around the world • Pen drawing on paper, digitally colored in Adobe Photoshop",
  "illus-14.webp": "Screen printing on paper",
  "illustration-homme-qui-dort-sur-le-sol.webp": "Illustration created for BPM Theatre Company, for Marc Granier’s play Frantz • Digital painting • Photobashing in Adobe Photoshop",
  "couverture-album-purple-smile.webp": "Digital Painting in Adobe Photoshop",
  "reproduction-tableau-la-laitière-photoshop.webp": "Digital Painting study in Adobe Photoshop",
  "illustration-homme-assit-dans-une-main-fond-ciel-avec-des-poissons.webp": "Illustration for a comic book project, in collaboration with theatre director Marc Granier • Pen on paper with digital coloring in Adobe Photoshop",
};

export function illustrationCaption(src: string): string | undefined {
  return captions[src.split("/").pop() ?? ""];
}
