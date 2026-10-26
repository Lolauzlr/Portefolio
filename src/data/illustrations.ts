// Short description shown under each illustration in the lightbox, keyed by
// file name (the same image has the same caption on the Home and on the
// Illustrations page).
const captions: Record<string, string> = {
  "illus-35.webp": "2D Illustration • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-3.webp": "Illustration from the short film The Beast: a man in a yellow jacket and a ghostly figure in a harlequin pattern swimming among tropical fish underwater",
  "illus-4.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-5.webp": "Comic book project • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-25.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-36.webp": "Fan art of Vi and Caitlyn from Arcane pressing their foreheads together, Caitlyn holding Vi's face, under a pair of large pink eyes",
  "illus-1.webp": "Fan art of Jinx and Vi from Arcane: Jinx with her blue braids and Vi with her pink hair, wielding oversized mechanical gauntlets and a minigun in a burst of yellow and electric colours",
  "illus-7.webp": "Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-6.webp": "Digital Painting in Adobe Photoshop",
  "illus-2.webp": "Concept Art for a short film • Traditional ink drawing with digital coloring in Adobe Photoshop",
  "illus-16.webp": "Cyberpunk version of Asterix and Obelix: Obelix, with a mechanical arm, sits beside a glowing green tank while Asterix, masked and holding a sword, crouches on a speaker, and Dogmatix plays on the floor",
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
  "illus-8.webp": "Illustration created for BPM Theatre Company, for Marc Granier’s play Frantz • Digital Painting in Adobe Photoshop",
  "illus-11.webp": "Screen printing on paper",
  "illus-12.webp": "Screen printing on paper",
  "illus-22.webp": "Disney Art Challenge submission • Pencil on paper with digital coloring in Adobe Photoshop",
  "illus-28.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-21.webp": "Concept Art for a short film • Digital Painting in Adobe Photoshop",
  "illus-9.webp": "Digital Painting in Adobe Photoshop",
  "illus-29.webp": "Illustration created for BPM Theatre Company, for Marc Granier’s play Frantz • Digital Painting in Adobe Photoshop",
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

// Text alternative describing what each illustration shows (the captions above
// describe the technique and project, not the picture).
const alts: Record<string, string> = {
  "couverture-album-purple-smile.webp": "Album cover \"The girl with the purple smile\": a woman in profile painted in golden brushstrokes against a deep blue background",
  "illus-1.webp": "Two stylised fighters, one with blue braids and one with pink hair, wielding oversized mechanical gauntlets and a minigun in a burst of yellow and electric colours",
  "illus-10.webp": "Snow-covered mountain valley under a pink and violet starry sky",
  "illus-11.webp": "Blue ink illustration of a climber hanging from a rope below the roof of a traditional East Asian temple",
  "illus-12.webp": "Blue ink illustration of a hand holding chopsticks over a bowl of ramen filled with tiny people",
  "illus-13.webp": "A warrior mouse in green samurai armour holding a saw-like sword while pieces of cheese fly around it in a forest",
  "illus-14.webp": "Red ink drawing of a sumo wrestler and a woman in a kimono facing each other, with a red seal below",
  "illus-15.webp": "Ink-wash portrait of a wrestler's mask with red petals scattered around it",
  "illus-16.webp": "Cyberpunk basement: a large character with a mechanical arm sits beside a glowing green tank while a masked fighter with a sword crouches on a speaker and a small dog plays on the floor",
  "illus-18.webp": "An old man with a cane holding a burning torch and a glowing flame in the dark",
  "illus-2.webp": "Two lovers kissing: one with curly black hair and a rainbow-coloured neck, the other drawn in white outline, on beige paper",
  "illus-21.webp": "A girl with red hair walking alone in front of a crowd drawn in line art, on a cyan to blue background",
  "illus-22.webp": "A diver in a yellow suit exploring a colourful coral reef, with a small submarine below",
  "illus-23.webp": "A young adventurer with red hair, goggles and a white and blue cape sitting on a rock above orange desert dunes",
  "illus-24.webp": "A tall black penguin holding a long tool over a person at a desk facing a computer, their head a burst of yellow hair",
  "illus-25.webp": "Rose, a child in a red jacket and yellow hat seen from behind, facing a misty forest of bare trees",
  "illus-26.webp": "A man in an orange vest sitting on the porch of a snowy wooden house, with a small child in orange beside him",
  "illus-27.webp": "Expressive pastel figure with wild dark hair, drawn as a blur of pink, blue and yellow strokes on a cream background",
  "illus-28.webp": "A figure in the dark covering their face with a hand, lit by red and teal light",
  "illus-29.webp": "Portrait of a young man with blue hair talking on the phone, with a sailboat sketched behind him",
  "illus-3.webp": "A man in a yellow jacket and a ghostly figure in a harlequin pattern swimming among tropical fish underwater",
  "illus-30.webp": "A knight with a red cape on a cliff, looking at a castle built on a giant fallen helmet among the clouds",
  "illus-31.webp": "A caveman with a club riding a green dinosaur in front of a large yellow sun",
  "illus-32.webp": "A traveller sitting on the roof of a yellow van on a mountain road, looking at a turquoise lake and snowy peaks",
  "illus-33.webp": "A giraffe and a raccoon riding a green scooter along a coastal road",
  "illus-34.webp": "A small red monster with sharp teeth floating in a glowing green bottle, in the dark",
  "illus-35.webp": "A skater with a fishbowl helmet riding a purple skateboard in a swirl of pastel colours",
  "illus-36.webp": "Two soldiers in period uniforms pressing their foreheads together, one holding the other's face, under a pair of large pink eyes",
  "illus-4.webp": "A wooden cabin and a fence buried in snow in a winter forest",
  "illus-5.webp": "A boat-shaped house with a windmill and a red umbrella on its deck, floating on a deep blue sea",
  "illus-6.webp": "Giant hands holding a cocktail with a lemon slice and a straw, with a small traveller climbing out of the glass",
  "illus-7.webp": "A sailing ship fighting huge stormy waves",
  "illus-8.webp": "A man in a yellow jacket pulled through the air by a sailboat's sail, with tools flying behind him",
  "illus-9.webp": "Two wrestlers locked in a hold on a yellow mat, painted in bright colours",
  "illustration-homme-assit-dans-une-main-fond-ciel-avec-des-poissons.webp": "A man in a yellow shirt and tie sitting in a giant hand in a cloudy sky full of fish",
  "illustration-homme-qui-dort-sur-le-sol.webp": "A bearded man sleeping on the floor, painted in soft watercolour tones",
  "reproduction-tableau-la-laitière-photoshop.webp": "Digital study of Vermeer's The Milkmaid: a woman in a yellow bodice and blue apron pouring milk at a table",
};

export function illustrationAlt(src: string): string {
  return alts[src.split("/").pop() ?? ""] ?? "";
}
