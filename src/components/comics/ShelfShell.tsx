"use client";

import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  canInteract,
  canTurn,
  isBusy,
  nextState,
  type ShelfEvent,
  type ShelfState,
} from "@/components/comics/machine";
import type { SceneHandle } from "@/components/comics/scene";
import ShelfInfoPanel from "@/components/comics/ShelfInfoPanel";
import { ShellContext, type ShellApi } from "@/components/comics/shell-context";
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
/** Effacement de l'article quand la lecture s'enchaîne depuis la page de détail. */
const ARTICLE_FADE_MS = 240;

/** L'adresse telle que le routeur la donne, réduite à ce dont la coquille a besoin. */
type Route = { slug: string | null; reading: boolean; spread: number };

function readingHref(slug: string, spread: number): string {
  return spread === 0 ? `/comics/${slug}/lire` : `/comics/${slug}/lire/${spread}`;
}

export default function ShelfShell({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const slugSegment = segments[0] ?? null;
  const isReading = segments[1] === "lire";
  const readingIndex = isReading ? Number(segments[2] ?? "0") : 0;
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
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
  /** L'article s'efface sur le canevas au lieu d'être coupé derrière un voile. */
  const [articleOut, setArticleOut] = useState(false);
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
        router.push("/comics");
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

  /**
   * Depuis la page de détail : la couverture est déjà rabattue et la caméra engagée
   * dans le livre. La lecture reprend cette pose telle quelle, sans refermer d'abord :
   * l'article s'efface sur l'ouverture déjà commencée.
   */
  const readFromArticle = useCallback(async () => {
    const scene = sceneRef.current;
    const index = selectedRef.current;
    const slug = COMICS[index ?? -1]?.slug;
    if (!scene || index === null || !slug) return;
    if (!advance("read")) return;

    setReadingChrome(true);
    scene.setPickingEnabled(false);
    // Le canevas revient sous l'article, qui s'efface par-dessus : la scène tient déjà
    // la pose où l'article nous avait amenés, il n'y a rien à masquer.
    scene.setVisible(true);
    scene.renderOnce(); // sans ce cadre forcé, le canvas réapparaît noir
    setCanvasHidden(false);
    setArticleOut(true);

    // L'ouverture court pendant l'effacement : ses premières centaines de
    // millisecondes ne font que charger les planches, sur une image immobile.
    const opening = scene.openForReading(index, 0, true);
    await wait(ARTICLE_FADE_MS);
    if (!mountedRef.current) return;
    setShowArticle(false);
    setArticleOut(false);

    await opening;
    if (!mountedRef.current) return;
    if (!advance("done")) return;
    scene.setTurningEnabled(true);
    selfNavigatedRef.current += 1;
    router.push(readingHref(slug, 0));
  }, [advance, router]);

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
      void scene.select(index, true);
    },
    [enterReading, setPhase, setSelected],
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

    const onResize = () => sceneRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // Monté une seule fois : la scène doit survivre aux changements de segment.
  }, []);

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

  // Le contexte ne vaut quelque chose que si la scène est réellement montée :
  // sans quoi BackToShelf doit retomber sur la navigation ordinaire du lien.
  const api = useMemo<ShellApi | null>(
    () =>
      ready
        ? {
            requestExit: () => void exit({ navigate: true }),
            requestReading: () => void readFromArticle(),
          }
        : null,
    [ready, exit, readFromArticle],
  );

  // La désignation reste à l'échelle du survol (voir select() dans scene.ts) :
  // le panneau peut donc rester affiché une fois un livre désigné, pas
  // seulement pendant le survol - la désignation l'emporte sur un survol
  // ultérieur (ex. la souris qui traîne sur l'autre livre sans cliquer).
  const highlightIndex = selected ?? hoveredIndex;
  const highlightedSlug = highlightIndex !== null ? (COMICS[highlightIndex]?.slug ?? null) : null;
  const highlightedComic = highlightedSlug ? (comicBySlug(highlightedSlug) ?? null) : null;

  return (
    <ShellContext.Provider value={api}>
      <div className="relative min-h-screen bg-[#15161b] text-white">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="fixed inset-0 h-full w-full"
          style={{
            display: canvasHidden ? "none" : "block",
            pointerEvents: canInteract(state) || canTurn(state) ? "auto" : "none",
          }}
        />

        {/* Panneau d'info façon "Pick a story" : reflète le survol puis la
            désignation, toutes deux à la même échelle (voir select() dans
            scene.ts) - le clic garde son propre effet range/sors et son
            ouverture, inchangés (voir handlePick). READ rejoue la même
            ouverture animée qu'un second clic sur le livre. */}
        {ready && (state === "SHELF" || state === "SELECTED") && highlightIndex !== null && (
          <ShelfInfoPanel comic={highlightedComic} onRead={() => void readFromPanel(highlightIndex)} />
        )}

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
            main (`ready`) ; elle ne passe en `sr-only` qu'une fois la 3D montée
            et hors de l'état INSIDE, où c'est l'article qui doit s'afficher. */}
        <div
          className={!ready || showArticle ? "relative z-10" : "sr-only"}
          style={{ opacity: articleOut ? 0 : 1, transition: `opacity ${ARTICLE_FADE_MS}ms ease` }}
        >
          {children}
        </div>
      </div>
    </ShellContext.Provider>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
