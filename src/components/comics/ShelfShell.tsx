"use client";

import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  canInteract,
  canTurn,
  isBusy,
  nextState,
  type ShelfEvent,
  type ShelfState,
} from "@/components/comics/machine";
import BookSlider from "@/components/comics/BookSlider";
import type { SceneHandle } from "@/components/comics/scene";
import ShelfInfoPanel from "@/components/comics/ShelfInfoPanel";
import { COMICS, comicBySlug } from "@/lib/comics";

/**
 * Livre désigné par défaut, avant tout clic. select() ne fait plus de gros
 * plan depuis la correction de setHover/select (le gros plan reste réservé
 * à open()/openForReading()) : le désigner d'emblée est donc sûr, l'autre
 * livre restant visible et cliquable à côté.
 */
const DEFAULT_SLUG = "old-knight";

const OVERLAY_MS = 320;

/**
 * Accumulation exigée avant de tourner. Un cran de molette la franchit d'un coup ;
 * un pavé tactile, qui émet des dizaines d'événements de faible amplitude par geste,
 * la franchit en quelques-uns.
 */
const WHEEL_STEP = 50;
/**
 * Silence exigé avant d'accepter un nouveau geste : l'inertie d'un pavé tactile
 * continue d'émettre bien après que le doigt a quitté la surface, et chacun de ces
 * événements enchaînerait une double page.
 */
const WHEEL_IDLE_MS = 180;
/** `deltaMode` 1 compte en lignes : hauteur de ligne usuelle des navigateurs. */
const WHEEL_LINE_PX = 16;
/**
 * Écart voulu entre le livre le plus à droite et la card d'info, en desktop.
 * Le canevas occupe toute la largeur de la page (voir le rendu plus bas) : un
 * simple `gap` CSS laisserait un vide qui varie avec la largeur de fenêtre.
 * La card est donc posée (voir refreshCardGap) à un écart constant de la
 * position réelle des livres, plutôt qu'au bord du canevas.
 */
const CARD_GAP_PX = 40;

/** L'adresse telle que le routeur la donne, réduite à ce dont la coquille a besoin. */
type Route = { slug: string | null; reading: boolean; spread: number };

function readingHref(slug: string, spread: number): string {
  return spread === 0 ? `/storyboard/${slug}/lire` : `/storyboard/${slug}/lire/${spread}`;
}

export default function ShelfShell({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  /** Affiché en permanence au-dessus de l'étagère, seulement sur la page
   *  index (jamais pendant la lecture, qui passe l'étagère en plein écran). */
  header?: React.ReactNode;
  /** Idem, en dessous — la section "Storyboards" sur /storyboard. */
  footer?: React.ReactNode;
}) {
  const segments = useSelectedLayoutSegments();
  const slugSegment = segments[0] ?? null;
  const isReading = segments[1] === "lire";
  const readingIndex = isReading ? Number(segments[2] ?? "0") : 0;
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  /** Enfant de flux (pas de position fixe) : décalé à la main (transform) sur
   *  la position réelle des livres, voir refreshCardGap. */
  const panelWrapperRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<ShelfState>(slugSegment && !isReading ? "INSIDE" : "SHELF");
  const selectedRef = useRef<number | null>(null);
  /** null : rien en attente. Sinon : adresse reçue pendant une transition. */
  const pendingRouteRef = useRef<Route | null>(null);
  /**
   * Navigations que la coquille a déclenchées elle-même et dont la réconciliation
   * n'est pas encore revenue. Un compteur, pas un drapeau : deux tourne-pages
   * enchaînés avant que le routeur n'ait commité le premier laisseraient sinon la
   * seconde réconciliation se croire subie, et la scène reculerait d'une page.
   */
  const selfNavigatedRef = useRef(0);
  const initialSegmentRef = useRef(slugSegment);
  const initialReadingRef = useRef(isReading);
  const mountedRef = useRef(true);
  /** Lue une seule fois à la construction de la scène, réutilisée par `exit`. */
  const reducedMotionRef = useRef(false);
  /**
   * La scène n'est construite qu'une fois et ne doit pas capturer une version périmée
   * des gestionnaires : ses rappels passent par ce relais.
   */
  const pickRef = useRef<(index: number) => void>(() => {});
  const dismissRef = useRef<() => void>(() => {});
  const turnRef = useRef<(direction: -1 | 1) => void>(() => {});

  const [ready, setReady] = useState(false);
  const [state, setStateValue] = useState<ShelfState>(
    slugSegment && !isReading ? "INSIDE" : "SHELF",
  );
  const [selected, setSelectedValue] = useState<number | null>(null);
  // Pilote uniquement le panneau d'info pendant le survol de l'étagère (rien
  // n'est encore désigné) - la désignation (clic) prend le relais une fois
  // `selected` posé.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showArticle, setShowArticle] = useState(Boolean(slugSegment) && !isReading);
  const [overlay, setOverlay] = useState(0);
  /** Vrai tant que la scène n'a pas pris la main : le canvas plein écran ne doit
   * jamais recouvrir la grille de repli avant que `ready` ne soit posé. */
  const [canvasHidden, setCanvasHidden] = useState(true);
  /**
   * Vrai de l'intention de lire jusqu'au retour effectif à l'étagère. L'état ne suffit
   * pas à le déduire : `CLOSING` sert aussi au retour de la page article, où la barre
   * de navigation doit rester en place.
   */
  const [readingChrome, setReadingChrome] = useState(false);

  const setPhase = useCallback((next: ShelfState) => {
    stateRef.current = next;
    setStateValue(next);
  }, []);

  const setSelected = useCallback((index: number | null) => {
    selectedRef.current = index;
    setSelectedValue(index);
  }, []);

  /** Fait franchir une suite d'événements à la machine ; rend faux si l'un est refusé. */
  const advance = useCallback(
    (...events: ShelfEvent[]) => {
      let next = stateRef.current;
      for (const event of events) {
        const candidate = nextState(next, event);
        if (candidate === null) return false;
        next = candidate;
      }
      setPhase(next);
      return true;
    },
    [setPhase],
  );

  const indexOfSlug = useCallback(
    (slug: string) => COMICS.findIndex((comic) => comic.slug === slug),
    [],
  );

  // --- intentions ----------------------------------------------------------
  /**
   * La lecture ne fait pas entrer dans le livre : ni voile, ni canvas masqué. Le livre
   * s'ouvre, la caméra recule sur la double page, et l'URL suit en silence.
   */
  const enterReading = useCallback(
    async (index: number) => {
      const scene = sceneRef.current;
      const slug = COMICS[index]?.slug;
      if (!scene || !slug) return;
      if (!advance("read")) return;

      setReadingChrome(true);
      scene.setPickingEnabled(false);
      await scene.openForReading(index, 0, true);
      if (!mountedRef.current) return;
      setSelected(index);
      if (!advance("done")) return;
      scene.setTurningEnabled(true);
      selfNavigatedRef.current += 1;
      router.push(readingHref(slug, 0));
    },
    [advance, router, setSelected],
  );

  /**
   * Bouton READ du panneau : le livre n'est parfois que survolé (jamais
   * cliqué) - la désignation se pose alors ici, sans animation ni saut
   * visible puisque enterReading part aussitôt de la même pose pour son
   * propre agrandissement.
   */
  const readFromPanel = useCallback(
    async (index: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (stateRef.current === "SHELF") {
        if (!advance("select")) return;
        setSelected(index);
        await scene.select(index, false);
        if (!mountedRef.current) return;
      }
      void enterReading(index);
    },
    [advance, enterReading, setSelected],
  );

  /** `navigate` est faux quand le navigateur a déjà changé l'URL lui-même. */
  const exit = useCallback(
    async ({ navigate }: { navigate: boolean }) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (nextState(stateRef.current, "close") === null) return;

      // Depuis la lecture tout se joue déjà sur le canvas : aucun voile à monter.
      const veiled = stateRef.current !== "READING";
      setPhase("CLOSING");
      scene.setTurningEnabled(false);

      if (veiled) {
        setOverlay(1);
        await wait(OVERLAY_MS);
        if (!mountedRef.current) return;
      }
      setShowArticle(false);

      if (navigate) {
        selfNavigatedRef.current += 1;
        router.push("/storyboard");
      }

      scene.setVisible(true);
      scene.renderOnce(); // sans ce cadre forcé, le canvas réapparaît noir
      setCanvasHidden(false);

      // Chevauchement volontaire : la caméra recule derrière le voile encore opaque,
      // qui ne se lève qu'une fois ce recul terminé — jamais avant.
      const closing = scene.close(true);
      if (veiled) {
        await wait(reducedMotionRef.current ? 160 : 450);
        if (!mountedRef.current) return;
        setOverlay(0);
      }
      await closing;
      if (!mountedRef.current) return;
      // Le livre lu reste désigné au retour : l'étagère ne doit jamais se
      // retrouver sans aucun livre désigné (voir handleDismiss plus bas).
      const index = selectedRef.current;
      if (index !== null) await scene.select(index, true);
      if (!mountedRef.current) return;
      setPhase("SELECTED");
      setReadingChrome(false);
      scene.setPickingEnabled(true);
    },
    [router, setPhase],
  );

  /** Tourne-page sans navigation : sert aussi au retour du navigateur. */
  const goTo = useCallback(
    async (target: number, animate: boolean) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (target < 0 || target >= scene.spreadCount()) return;
      if (target === scene.currentSpread()) return;
      if (!advance("turn")) return;

      await scene.goToSpread(target, animate);
      if (!mountedRef.current) return;
      advance("done");
    },
    [advance],
  );

  const turn = useCallback(
    async (direction: -1 | 1) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (nextState(stateRef.current, "turn") === null) return;

      const target = scene.currentSpread() + direction;
      if (target < 0 || target >= scene.spreadCount()) return;

      await goTo(target, true);
      if (!mountedRef.current) return;
      const slug = COMICS[selectedRef.current ?? -1]?.slug;
      if (!slug) return;
      selfNavigatedRef.current += 1;
      router.push(readingHref(slug, target));
    },
    [goTo, router],
  );

  /** Chemin du lien profond : la double page est posée sans rejouer l'ouverture. */
  const enterReadingDirect = useCallback(
    async (index: number, spread: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const entry: ShelfEvent[] =
        stateRef.current === "INSIDE" ? ["close", "done", "select", "read"] : ["select", "read"];
      if (!advance(...entry)) return;

      setReadingChrome(true);
      scene.enterImmediate(index);
      scene.setPickingEnabled(false);
      scene.setVisible(true);
      setSelected(index);
      setShowArticle(false);
      setOverlay(0);
      setCanvasHidden(false);

      await scene.openForReading(index, spread, false);
      if (!mountedRef.current) return;
      if (!advance("done")) return;
      scene.setTurningEnabled(true);
      scene.renderOnce();
    },
    [advance, setSelected],
  );

  /**
   * Recale la card sur la position réelle des livres, plutôt que sur un point
   * fixe du viewport : lue après coup (jamais pendant un tween de select(), dont
   * la coroutine n'a pas fini de bouger les livres), donc toujours appelée une
   * fois la désignation retombée, jamais depuis son déclenchement. Sans effet si
   * la card n'est pas montée (hors SHELF/SELECTED).
   */
  const refreshCardGap = useCallback(() => {
    const scene = sceneRef.current;
    const wrapper = panelWrapperRef.current;
    if (!scene || !wrapper) return;
    const edge = scene.contentRightEdge();
    // La card est posée en absolute par-dessus le canevas (voir le rendu plus
    // bas) : le canevas garde ainsi toute la largeur de la page, et les livres
    // se centrent sur la page réelle, pas sur la largeur amputée d'une card
    // voisine. `left`, pas un `transform` : la card doit rester ancrée à
    // l'écart voulu des livres même si le conteneur change de taille.
    wrapper.style.left = `${edge + CARD_GAP_PX}px`;
  }, []);

  const handlePick = useCallback(
    (index: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const current = stateRef.current;
      if (!canInteract(current)) return;
      if (!COMICS[index]?.slug) return; // album à venir

      if (current === "SELECTED" && selectedRef.current === index) {
        void enterReading(index);
        return;
      }
      if (nextState(current, "select") === null) return;
      setPhase("SELECTED");
      setSelected(index);
      void scene.select(index, true).then(refreshCardGap);
    },
    [enterReading, setPhase, setSelected, refreshCardGap],
  );

  /**
   * Un clic hors des livres ne range plus rien : l'étagère garde toujours son
   * dernier livre désigné (jamais les deux à la fois "en rayon"), qu'on
   * clique en dehors ou qu'on revienne de la lecture (voir exit()).
   */
  const handleDismiss = useCallback(() => {}, []);

  useEffect(() => {
    pickRef.current = handlePick;
  }, [handlePick]);

  useEffect(() => {
    dismissRef.current = handleDismiss;
  }, [handleDismiss]);

  useEffect(() => {
    turnRef.current = (direction) => {
      // Un clic à gauche de la première double page, c'est rabattre la couverture :
      // le livre se referme et retourne sur l'étagère.
      if (
        direction === -1 &&
        canTurn(stateRef.current) &&
        sceneRef.current?.currentSpread() === 0
      ) {
        void exit({ navigate: true });
        return;
      }
      void turn(direction);
    };
  }, [exit, turn]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Posé une seule fois, à l'entrée sur /storyboard (jamais rejoué pendant la
  // navigation interne étagère <-> lecture, la coquille restant montée d'un
  // bout à l'autre) : évite qu'un défilement resté du chargement précédent,
  // ou un rattrapage du navigateur pendant le premier rendu, ne laisse la
  // page ouverte plus bas que le haut de l'étagère.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- réconciliation avec le routeur -------------------------------------
  const reconcile = useCallback(
    (route: Route) => {
      const scene = sceneRef.current;
      if (!scene) return;

      if (selfNavigatedRef.current > 0) {
        selfNavigatedRef.current -= 1;
        // Notre propre navigation supplante toute intention reçue pendant la
        // transition : la rejouer enchaînerait deux transitions coup sur coup.
        pendingRouteRef.current = null;
        // La lecture garde le canvas : c'est la coroutine qui a déjà posé l'état.
        if (route.slug && !route.reading) {
          setShowArticle(true);
          setOverlay(0);
          setCanvasHidden(true);
          setPhase("INSIDE");
        }
        return;
      }

      if (isBusy(stateRef.current)) {
        pendingRouteRef.current = route; // rejoué dès la fin de la transition
        return;
      }

      if (route.slug && route.reading) {
        const index = indexOfSlug(route.slug);
        if (index < 0) return;
        if (stateRef.current === "READING" && selectedRef.current === index) {
          void goTo(route.spread, true); // le navigateur a changé de double page
        } else {
          void enterReadingDirect(index, route.spread); // lien profond
        }
        return;
      }

      if (route.slug && stateRef.current !== "INSIDE") {
        const index = indexOfSlug(route.slug);
        if (index < 0) return;
        scene.enterImmediate(index);
        scene.setVisible(false);
        setCanvasHidden(true);
        scene.setPickingEnabled(false);
        setSelected(index);
        setShowArticle(true);
        setOverlay(0);
        setPhase("INSIDE");
      } else if (
        !route.slug &&
        (stateRef.current === "INSIDE" || stateRef.current === "READING")
      ) {
        void exit({ navigate: false });
      }
    },
    [enterReadingDirect, exit, goTo, indexOfSlug, setPhase, setSelected],
  );

  useEffect(() => {
    if (!ready) return;
    const route: Route = { slug: slugSegment, reading: isReading, spread: readingIndex };
    // Différé d'une micro-tâche : la resynchronisation avec le routeur reste un
    // effet de bord sur un système externe, mais ne doit pas poser son `setState`
    // dans le corps synchrone de l'effet.
    queueMicrotask(() => reconcile(route));
  }, [slugSegment, isReading, readingIndex, ready, reconcile]);

  useEffect(() => {
    if (isBusy(state)) return;
    const pending = pendingRouteRef.current;
    if (pending === null) return;
    pendingRouteRef.current = null;
    reconcile(pending);
  }, [state, reconcile]);

  // --- construction de la scène -------------------------------------------
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // La sonde se fait sur un canvas jetable, jamais sur celui de la scène :
    // obtenir un contexte réel sur le canvas final figerait ses attributs et
    // ferait ignorer silencieusement les options passées à THREE.WebGLRenderer.
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    // Cette version de three a retiré le rendu WebGL1 : un repli sur "webgl" ici
    // serait activement nuisible, la sonde réussirait puis createScene lèverait.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    if (!gl) return; // sans WebGL2, la grille de repli reste visible

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reducedMotion;

    void import("@/components/comics/scene")
      .then(({ createScene }) => {
        if (disposed) return;
        try {
          const handle = createScene(canvas, COMICS, {
            reducedMotion,
            onHoverChange: (index) => setHoveredIndex(index),
            onPick: (index) => pickRef.current(index),
            onDismiss: () => dismissRef.current(),
            onTurn: (direction) => turnRef.current(direction),
          });
          sceneRef.current = handle;

          const first = initialSegmentRef.current;
          const index = first ? COMICS.findIndex((comic) => comic.slug === first) : -1;
          if (index >= 0 && !initialReadingRef.current) {
            handle.enterImmediate(index);
            handle.setVisible(false);
            handle.setPickingEnabled(false);
            selectedRef.current = index;
            setSelectedValue(index);
          } else if (index >= 0) {
            // Lien profond de lecture : le canvas reste en scène, c'est la
            // réconciliation qui ouvre la double page demandée.
            handle.setPickingEnabled(false);
            selectedRef.current = index;
            setSelectedValue(index);
            setCanvasHidden(false);
          } else {
            // Étagère nue (pas de slug, pas de lecture) : le premier livre
            // est désigné d'emblée (sans animation), l'autre restant visible
            // et cliquable à côté - select() ne fait plus de gros plan.
            const defaultIndex = COMICS.findIndex((comic) => comic.slug === DEFAULT_SLUG);
            if (defaultIndex >= 0) {
              void handle.select(defaultIndex, false);
              stateRef.current = "SELECTED";
              setStateValue("SELECTED");
              selectedRef.current = defaultIndex;
              setSelectedValue(defaultIndex);
            }
            setCanvasHidden(false);
          }
          setReady(true);
        } catch {
          // Le moteur exige WebGL2 et a levé malgré une sonde positive : on reste
          // sur la grille de repli, `ready` n'est pas posé et `sceneRef` reste nul.
        }
      })
      .catch(() => {
        // Import du module de scène en échec : même repli, la grille reste visible.
      });

    // Le canevas ne change plus de taille seulement avec la fenêtre : la card
    // voisine, en flux depuis la nouvelle mise en page, lui cède ou lui reprend
    // de la largeur à chaque apparition/disparition (SELECTED ↔ READING). Un
    // ResizeObserver sur le canevas lui-même couvre les deux causes, là où
    // l'écoute de "resize" sur la fenêtre ne voyait que la première.
    const onResize = () => {
      sceneRef.current?.resize();
      refreshCardGap();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    return () => {
      disposed = true;
      resizeObserver.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // Monté une seule fois : la scène doit survivre aux changements de segment.
    // refreshCardGap est stable (deps vides) : l'ajouter ici ne fait pas revivre
    // cet effet à chacun de ses appels.
  }, [refreshCardGap]);

  // --- clavier -------------------------------------------------------------
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const scene = sceneRef.current;
      if (!scene) return;

      if (event.key === "Escape" && (stateRef.current === "INSIDE" || canTurn(stateRef.current))) {
        event.preventDefault();
        void exit({ navigate: true });
        return;
      }
      if (canTurn(stateRef.current)) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          void turn(event.key === "ArrowRight" ? 1 : -1);
        }
        return;
      }
      if (!canInteract(stateRef.current)) return;

      const playable = COMICS.map((comic, i) => (comic.slug ? i : -1)).filter((i) => i >= 0);
      if (playable.length === 0) return;

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const at = selectedRef.current === null ? -1 : playable.indexOf(selectedRef.current);
        handlePick(playable[(at + step + playable.length) % playable.length]);
      } else if (event.key === "Enter" && selectedRef.current !== null) {
        event.preventDefault();
        void enterReading(selectedRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterReading, exit, handlePick, turn]);

  // --- molette --------------------------------------------------------------
  useEffect(() => {
    let acc = 0;
    let locked = false;
    let idle = 0;

    const closeGesture = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(function settle() {
        // Relâcher pendant la tourne laisserait la fin du même geste en enchaîner
        // une seconde : on attend qu'elle soit finie, puis un nouveau silence.
        if (stateRef.current === "TURNING") {
          idle = window.setTimeout(settle, WHEEL_IDLE_MS);
          return;
        }
        locked = false;
        acc = 0;
      }, WHEEL_IDLE_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (!canTurn(stateRef.current) && stateRef.current !== "TURNING") return;
      event.preventDefault();
      closeGesture();
      if (locked) return;

      const unit =
        event.deltaMode === 1
          ? WHEEL_LINE_PX
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      acc += event.deltaY * unit;
      if (Math.abs(acc) < WHEEL_STEP) return;

      locked = true;
      // Vers le bas on avance dans le récit : `turn` raisonne en numéro de double
      // page, et c'est la scène qui applique le sens de lecture inversé.
      void turn(acc > 0 ? 1 : -1);
      acc = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(idle);
    };
  }, [turn]);

  // La barre de navigation est rendue par le gabarit racine : cet attribut est le seul
  // levier depuis ici. Le nettoyage au démontage évite de la laisser masquée ailleurs.
  useEffect(() => {
    if (readingChrome) document.body.dataset.reading = "true";
    else delete document.body.dataset.reading;
    return () => {
      delete document.body.dataset.reading;
    };
  }, [readingChrome]);

  // La désignation reste à l'échelle du survol (voir select() dans scene.ts) :
  // le panneau peut donc rester affiché une fois un livre désigné, pas
  // seulement pendant le survol - la désignation l'emporte sur un survol
  // ultérieur (ex. la souris qui traîne sur l'autre livre sans cliquer).
  const highlightIndex = selected ?? hoveredIndex;
  const highlightedSlug = highlightIndex !== null ? (COMICS[highlightIndex]?.slug ?? null) : null;
  const highlightedComic = highlightedSlug ? (comicBySlug(highlightedSlug) ?? null) : null;

  // Filet : recale la card dès qu'elle apparaît ou qu'un livre change (les
  // tweens animés se rattrapent eux-mêmes via leur propre .then(refreshCardGap),
  // ceci couvre les cas déjà retombés - montage initial, retour de lecture).
  useLayoutEffect(() => {
    refreshCardGap();
  }, [state, highlightIndex, ready, refreshCardGap]);

  // Hors lecture, l'étagère ne prend que la hauteur de l'écran (comme un
  // "hero" en haut de page) : le reste de la page (header, footer) reste
  // joignable en défilant. Pendant la lecture, elle passe en plein écran fixe
  // et verrouillé, exactement comme sur l'ancienne page /comics - il n'y a
  // alors plus rien d'autre à atteindre sur cette page.
  const immersive = readingChrome;
  // L'entrée/sortie de lecture change l'URL (slugSegment) avant que la scène
  // n'ait fini d'animer : sans le && !immersive, header/footer réapparaissent
  // dès ce changement d'URL, pendant que l'étagère est encore en train de se
  // refermer/s'ouvrir en plein écran - on verrait alors la section
  // "Storyboards" par-dessous. `readingChrome` couvre toute l'animation, pas
  // seulement l'état READING stable.
  const showAround = !slugSegment && !immersive;

  return (
    <div className="relative min-h-screen bg-[#15161b] pt-[95px] text-white" style={{ overflowAnchor: "none" }}>
      {showAround && header}

      {/* Bloc plein écran (verrouillé pendant la lecture, en flux sinon) : le
          canevas garde toute la largeur de la page (jamais amputée par la
          card voisine) afin que la caméra, qui vise toujours le centre de la
          scène, centre bien les livres sur la page réelle - pas sur une
          largeur réduite par la card. La card est donc posée en absolute
          par-dessus, à l'écart voulu des livres (voir refreshCardGap), sans
          jamais peser sur la largeur du canevas. Sur mobile le panneau garde
          sa propre position fixe (voir ShelfInfoPanel) : l'absolute ne
          s'applique qu'à partir de `md:`. */}
      <div
        className={
          immersive
            ? "fixed inset-0 flex flex-col md:block"
            : "relative flex h-screen w-full flex-col md:block"
        }
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="min-h-0 w-full flex-1 md:absolute md:inset-0 md:h-full"
          style={{
            display: canvasHidden ? "none" : "block",
            pointerEvents: canInteract(state) || canTurn(state) ? "auto" : "none",
          }}
        />

        {/* Panneau d'info façon "Pick a story" : reflète le survol puis la
            désignation, toutes deux à la même échelle (voir select() dans
            scene.ts) - le clic garde son propre effet range/sors et son
            ouverture, inchangés (voir handlePick). READ rejoue la même
            ouverture animée qu'un second clic sur le livre. `left` (desktop)
            est posé à la main par refreshCardGap, pas en CSS : un `gap` fixe
            laisserait un vide qui varie avec la largeur de fenêtre, les
            livres n'occupant centrés qu'une fraction d'un canevas maintenant
            plein cadre. */}
        {ready && (state === "SHELF" || state === "SELECTED") && highlightIndex !== null && (
          <div
            ref={panelWrapperRef}
            className="flex flex-col items-center gap-4 md:absolute md:top-1/2 md:-translate-y-1/2"
          >
            <ShelfInfoPanel comic={highlightedComic} onRead={() => void readFromPanel(highlightIndex)} />
            {/* Garde la façon dont on changeait de livre côté "Pick a story" :
                un contrôle dédié, en plus du clic direct sur un livre. */}
            <BookSlider
              items={COMICS.map((comic, i) => ({ key: comic.slug ?? `upcoming-${i}`, label: comic.title }))}
              active={highlightIndex}
              onSelect={handlePick}
            />
          </div>
        )}
      </div>

      {/* Reste affiché pendant un tourne-page pour ne pas clignoter : la machine
          refuse `close` depuis TURNING, le bouton y est donc sans effet. */}
      {ready && (state === "READING" || state === "TURNING") && (
        <button
          type="button"
          onClick={() => void exit({ navigate: true })}
          className="fixed bottom-16 right-4 z-20 rounded-[40px] border-2 border-[#0fd1ea] bg-black/40 px-[32px] py-[20px] font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] backdrop-blur-[5px] transition-colors hover:bg-[#0fd1ea]/10 md:right-[120px]"
        >
          Sortir
        </button>
      )}

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 bg-[#131313] transition-opacity duration-300"
        style={{ opacity: overlay }}
      />

      {/* La grille reste visible tant que la scène n'a pas réellement pris la
          main (`ready`) ; elle ne passe en `sr-only` qu'une fois la 3D montée. */}
      <div className={!ready || showArticle ? "relative z-10" : "sr-only"}>{children}</div>

      {showAround && footer}
    </div>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
