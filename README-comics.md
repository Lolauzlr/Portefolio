# Section des récits dessinés

## Ajouter un album

1. Déposer la couverture et le dos dans `public/images/`.
   Proportions attendues : le dos fait environ 17 % de la hauteur de la couverture,
   la couverture environ 69 % de sa propre hauteur en largeur.
2. Ajouter une entrée dans `COMICS` de `src/lib/comics.ts` : `slug`, `title`, `year`,
   `status: "published"`, `cover` et `spine` passés par `asset()`, une couleur `accent`,
   et les planches dans `plates`.
3. Rien d'autre. La route, la page, le repli en grille et le livre sur l'étagère en
   découlent. Un album `status: "upcoming"` avec `slug: null` occupe une place sans
   être cliquable et sans générer de route.

L'étagère se recentre seule ; au-delà de six ou sept livres, revoir le cadrage de la
caméra dans `scene.ts` (`camera.position.z`).

## Limites connues

- Les couvertures d'origine montent à 18 mégapixels et sont réduites à la volée, à
  chaque chargement de page. Des dérivés à 1024 px déposés dans `public/` épargneraient
  ce travail au navigateur.
- Le bloc de pages est un volume plein : on n'ouvre pas le livre page à page.
- Sans WebGL, la section retombe sur une grille de couvertures. C'est volontaire.
- Les synopsis, mentions et planches sont des emplacements vides à remplir.
- Les ombres portées sont à bords durs : la version de three employée a retiré le
  filtrage doux (`PCFSoftShadowMap`) au profit d'un seul mode disponible
  (`PCFShadowMap`).
