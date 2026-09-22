"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { canInteract, isBusy, nextState, type ShelfState } from "@/components/comics/machine";
import type { SceneHandle } from "@/components/comics/scene";
import { ShellContext } from "@/components/comics/shell-context";
import { COMICS } from "@/lib/comics";

const OVERLAY_MS = 320;

export default function ShelfShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const stateRef = useRef<ShelfState>(segment ? "INSIDE" : "SHELF");
  const selectedRef = useRef<number | null>(null);
  /** undefined : rien en attente. null ou slug : segment reçu pendant une transition. */
  const pendingSegmentRef = useRef<string | null | undefined>(undefined);
  const selfNavigatedRef = useRef(false);
  const initialSegmentRef = useRef(segment);
  const mountedRef = useRef(true);
  /** Lue une seule fois à la construction de la scène, réutilisée par `exit`. */
  const reducedMotionRef = useRef(false);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  /**
   * La scène n'est construite qu'une fois et ne doit pas capturer une version périmée
   * des gestionnaires : ses rappels passent par ce relais.
   */
  const pickRef = useRef<(index: number) => void>(() => {});
  const dismissRef = useRef<() => void>(() => {});

  const [ready, setReady] = useState(false);
  const [state, setStateValue] = useState<ShelfState>(segment ? "INSIDE" : "SHELF");
  const [selected, setSelectedValue] = useState<number | null>(null);
  const [showArticle, setShowArticle] = useState(Boolean(segment));
  const [overlay, setOverlay] = useState(0);
  const [canvasHidden, setCanvasHidden] = useState(Boolean(segment));

  const setPhase = useCallback((next: ShelfState) => {
    stateRef.current = next;
    setStateValue(next);
  }, []);

  const setSelected = useCallback((index: number | null) => {
    selectedRef.current = index;
    setSelectedValue(index);
  }, []);

  const indexOfSlug = useCallback(
    (slug: string) => COMICS.findIndex((comic) => comic.slug === slug),
    [],
  );

  // --- intentions ----------------------------------------------------------
  const enter = useCallback(
    async (index: number) => {
      const scene = sceneRef.current;
      const slug = COMICS[index]?.slug;
      if (!scene || !slug) return;
      if (nextState(stateRef.current, "open") === null) return;

      setPhase("OPENING");
      scene.setPickingEnabled(false);
      await scene.open(true);
      if (!mountedRef.current) return;
      setOverlay(1);
      await wait(OVERLAY_MS);
      if (!mountedRef.current) return;
      scene.setVisible(false);
      setCanvasHidden(true);
      selfNavigatedRef.current = true;
      router.push(`/comics/${slug}`);
    },
    [router, setPhase],
  );

  /** `navigate` est faux quand le navigateur a déjà changé l'URL lui-même. */
  const exit = useCallback(
    async ({ navigate }: { navigate: boolean }) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (nextState(stateRef.current, "close") === null) return;

      setPhase("CLOSING");
      setOverlay(1);
      await wait(OVERLAY_MS);
      if (!mountedRef.current) return;
      setShowArticle(false);

      if (navigate) {
        selfNavigatedRef.current = true;
        router.push("/comics");
      }

      scene.setVisible(true);
      scene.renderOnce(); // sans ce cadre forcé, le canvas réapparaît noir
      setCanvasHidden(false);

      // Chevauchement volontaire : la caméra recule derrière le voile encore opaque,
      // qui ne se lève qu'une fois ce recul terminé — jamais avant.
      const revealDelay = reducedMotionRef.current ? 160 : 450;
      const closing = scene.close(true);
      await wait(revealDelay);
      if (!mountedRef.current) return;
      setOverlay(0);
      await closing;
      if (!mountedRef.current) return;
      await scene.deselect(true);
      if (!mountedRef.current) return;
      setSelected(null);
      setPhase("SHELF");
      scene.setPickingEnabled(true);
    },
    [router, setPhase, setSelected],
  );

  const handlePick = useCallback(
    (index: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const current = stateRef.current;
      if (!canInteract(current)) return;
      if (!COMICS[index]?.slug) return; // album à venir

      if (current === "SELECTED" && selectedRef.current === index) {
        void enter(index);
        return;
      }
      if (nextState(current, "select") === null) return;
      setPhase("SELECTED");
      setSelected(index);
      void scene.select(index, true);
    },
    [enter, setPhase, setSelected],
  );

  /** Un clic hors des livres range la sélection en cours, si le livre n'est pas déjà ouvert. */
  const handleDismiss = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (stateRef.current !== "SELECTED") return;
    setPhase("SHELF");
    setSelected(null);
    void scene.deselect(true);
  }, [setPhase, setSelected]);

  useEffect(() => {
    pickRef.current = handlePick;
  }, [handlePick]);

  useEffect(() => {
    dismissRef.current = handleDismiss;
  }, [handleDismiss]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // --- réconciliation avec le routeur -------------------------------------
  const reconcile = useCallback(
    (seg: string | null) => {
      const scene = sceneRef.current;
      if (!scene) return;

      if (selfNavigatedRef.current) {
        selfNavigatedRef.current = false;
        // Notre propre navigation supplante toute intention reçue pendant la
        // transition : la rejouer enchaînerait deux transitions coup sur coup.
        pendingSegmentRef.current = undefined;
        if (seg) {
          setShowArticle(true);
          setOverlay(0);
          setCanvasHidden(true);
          setPhase("INSIDE");
        }
        return;
      }

      if (isBusy(stateRef.current)) {
        pendingSegmentRef.current = seg; // rejoué dès la fin de la transition
        return;
      }

      if (seg && stateRef.current !== "INSIDE") {
        const index = indexOfSlug(seg);
        if (index < 0) return;
        scene.enterImmediate(index);
        scene.setVisible(false);
        setCanvasHidden(true);
        scene.setPickingEnabled(false);
        setSelected(index);
        setShowArticle(true);
        setOverlay(0);
        setPhase("INSIDE");
      } else if (!seg && stateRef.current === "INSIDE") {
        void exit({ navigate: false });
      }
    },
    [exit, indexOfSlug, setPhase, setSelected],
  );

  useEffect(() => {
    if (!ready) return;
    // Différé d'une micro-tâche : la resynchronisation avec le routeur reste un
    // effet de bord sur un système externe, mais ne doit pas poser son `setState`
    // dans le corps synchrone de l'effet.
    queueMicrotask(() => reconcile(segment));
  }, [segment, ready, reconcile]);

  useEffect(() => {
    if (isBusy(state)) return;
    const pending = pendingSegmentRef.current;
    if (pending === undefined) return;
    pendingSegmentRef.current = undefined;
    reconcile(pending);
  }, [state, reconcile]);

  // --- construction de la scène -------------------------------------------
  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return; // sans WebGL, la grille de repli reste visible

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedMotionRef.current = reducedMotion;

    void import("@/components/comics/scene").then(({ createScene }) => {
      if (disposed) return;
      const handle = createScene(canvas, COMICS, {
        reducedMotion,
        onHoverChange: () => {},
        onPick: (index) => pickRef.current(index),
        onDismiss: () => dismissRef.current(),
      });
      sceneRef.current = handle;

      const first = initialSegmentRef.current;
      const index = first ? COMICS.findIndex((comic) => comic.slug === first) : -1;
      if (index >= 0) {
        handle.enterImmediate(index);
        handle.setVisible(false);
        handle.setPickingEnabled(false);
        selectedRef.current = index;
        setSelectedValue(index);
      }
      setReady(true);
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

      if (event.key === "Escape" && stateRef.current === "INSIDE") {
        event.preventDefault();
        void exit({ navigate: true });
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
        void enter(selectedRef.current);
      } else if (event.key === "Escape" && stateRef.current === "SELECTED") {
        event.preventDefault();
        setPhase("SHELF");
        setSelected(null);
        void scene.deselect(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter, exit, handlePick, setPhase, setSelected]);

  useEffect(() => {
    if (state === "SELECTED") openButtonRef.current?.focus();
  }, [state]);

  const api = useMemo(() => ({ requestExit: () => void exit({ navigate: true }) }), [exit]);

  return (
    <ShellContext.Provider value={api}>
      <div className="relative min-h-screen bg-[#15161b] text-white">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="fixed inset-0 h-full w-full"
          style={{
            display: canvasHidden ? "none" : "block",
            pointerEvents: canInteract(state) ? "auto" : "none",
          }}
        />

        {ready && state === "SELECTED" && selected !== null && (
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => void enter(selected)}
            className="fixed bottom-16 left-1/2 z-20 -translate-x-1/2 rounded-[40px] border-2 border-[#0fd1ea] bg-black/40 px-[40px] py-[20px] font-[family-name:var(--font-heading)] text-[24px] tracking-[1.92px] uppercase text-[#0fd1ea] backdrop-blur-[5px] transition-colors hover:bg-[#0fd1ea]/10"
          >
            Ouvrir
          </button>
        )}

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30 bg-[#131313] transition-opacity duration-300"
          style={{ opacity: overlay }}
        />

        <div className={showArticle ? "relative z-10" : "sr-only"}>{children}</div>
      </div>
    </ShellContext.Provider>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
