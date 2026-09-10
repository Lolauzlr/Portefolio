"use client";

import { useEffect, useRef, useState } from "react";

type Anchor = { href: string; label: string };

const CANCEL_DRAG_X = 90;

function CaretUpDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.2" d="M35 20C35 22.9667 34.1203 25.8668 32.4721 28.3336C30.8238 30.8003 28.4812 32.7229 25.7403 33.8582C22.9994 34.9935 19.9834 35.2906 17.0737 34.7118C14.1639 34.133 11.4912 32.7044 9.39341 30.6066C7.29562 28.5088 5.86701 25.8361 5.28823 22.9264C4.70945 20.0166 5.0065 17.0006 6.14181 14.2597C7.27713 11.5189 9.19972 9.17618 11.6665 7.52796C14.1332 5.87973 17.0333 5 20 5C23.9783 5 27.7936 6.58035 30.6066 9.3934C33.4197 12.2064 35 16.0218 35 20Z" fill="currentColor" />
      <path d="M20 3.75C16.7861 3.75 13.6443 4.70305 10.972 6.48862C8.29969 8.27419 6.21689 10.8121 4.98696 13.7814C3.75704 16.7507 3.43524 20.018 4.06225 23.1702C4.68926 26.3224 6.23692 29.2179 8.50952 31.4905C10.7821 33.7631 13.6776 35.3108 16.8298 35.9378C19.982 36.5648 23.2493 36.243 26.2186 35.013C29.1879 33.7831 31.7258 31.7003 33.5114 29.028C35.297 26.3557 36.25 23.2139 36.25 20C36.2455 15.6916 34.5319 11.561 31.4855 8.51454C28.439 5.46806 24.3084 3.75455 20 3.75ZM20 33.75C17.2805 33.75 14.6221 32.9436 12.3609 31.4327C10.0997 29.9218 8.33737 27.7744 7.29666 25.2619C6.25596 22.7494 5.98366 19.9847 6.51421 17.3175C7.04476 14.6503 8.35432 12.2003 10.2773 10.2773C12.2003 8.35431 14.6503 7.04475 17.3175 6.5142C19.9848 5.98366 22.7494 6.25595 25.2619 7.29666C27.7744 8.33736 29.9218 10.0997 31.4327 12.3609C32.9436 14.6221 33.75 17.2805 33.75 20C33.7459 23.6455 32.2959 27.1404 29.7182 29.7182C27.1404 32.2959 23.6455 33.7459 20 33.75ZM25.8844 15.3656C26.0005 15.4818 26.0926 15.6196 26.1555 15.7714C26.2184 15.9231 26.2507 16.0858 26.2507 16.25C26.2507 16.4142 26.2184 16.5769 26.1555 16.7286C26.0926 16.8804 26.0005 17.0182 25.8844 17.1344C25.7682 17.2505 25.6304 17.3426 25.4786 17.4055C25.3269 17.4683 25.1643 17.5007 25 17.5007C24.8358 17.5007 24.6731 17.4683 24.5214 17.4055C24.3696 17.3426 24.2318 17.2505 24.1156 17.1344L20 13.0172L15.8844 17.1344C15.6498 17.3689 15.3317 17.5007 15 17.5007C14.6683 17.5007 14.3502 17.3689 14.1156 17.1344C13.8811 16.8998 13.7493 16.5817 13.7493 16.25C13.7493 15.9183 13.8811 15.6002 14.1156 15.3656L19.1156 10.3656C19.2317 10.2494 19.3696 10.1572 19.5213 10.0943C19.6731 10.0314 19.8357 9.99902 20 9.99902C20.1643 9.99902 20.3269 10.0314 20.4787 10.0943C20.6304 10.1572 20.7683 10.2494 20.8844 10.3656L25.8844 15.3656ZM25.8844 22.8656C26.0006 22.9817 26.0928 23.1196 26.1557 23.2713C26.2186 23.4231 26.251 23.5857 26.251 23.75C26.251 23.9143 26.2186 24.0769 26.1557 24.2287C26.0928 24.3804 26.0006 24.5183 25.8844 24.6344L20.8844 29.6344C20.7683 29.7506 20.6304 29.8428 20.4787 29.9057C20.3269 29.9686 20.1643 30.001 20 30.001C19.8357 30.001 19.6731 29.9686 19.5213 29.9057C19.3696 29.8428 19.2317 29.7506 19.1156 29.6344L14.1156 24.6344C13.8811 24.3998 13.7493 24.0817 13.7493 23.75C13.7493 23.4183 13.8811 23.1002 14.1156 22.8656C14.3502 22.6311 14.6683 22.4993 15 22.4993C15.3317 22.4993 15.6498 22.6311 15.8844 22.8656L20 26.9828L24.1156 22.8656C24.2317 22.7494 24.3696 22.6572 24.5213 22.5943C24.6731 22.5314 24.8357 22.499 25 22.499C25.1643 22.499 25.3269 22.5314 25.4787 22.5943C25.6304 22.6572 25.7683 22.7494 25.8844 22.8656Z" fill="currentColor" />
    </svg>
  );
}

export default function MobileAnchorNav({
  anchors,
  startSectionId,
  headerOffset = 95,
}: {
  anchors: Anchor[];
  startSectionId: string;
  headerOffset?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const target = document.getElementById(startSectionId);
    if (!target) return;

    const onScroll = () => {
      setVisible(target.getBoundingClientRect().top <= headerOffset + 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [startSectionId, headerOffset]);

  const updateIndexFromPoint = (x: number, y: number) => {
    const list = listRef.current;
    const btn = buttonRef.current;
    if (!list || !btn) return;

    if (btn.getBoundingClientRect().left - x > CANCEL_DRAG_X) {
      setCancelled(true);
      setIndex(null);
      return;
    }

    const rect = list.getBoundingClientRect();
    const relY = y - rect.top;
    const raw = Math.floor((relY / rect.height) * anchors.length);
    const clamped = Math.min(anchors.length - 1, Math.max(0, raw));

    setCancelled(false);
    setIndex((prev) => {
      if (prev !== clamped && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
      return clamped;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setCancelled(false);
    setIndex(null);
    setActive(true);
    requestAnimationFrame(() => updateIndexFromPoint(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!active) return;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    updateIndexFromPoint(e.clientX, e.clientY);
  };

  const finish = (shouldNavigate: boolean) => {
    if (shouldNavigate && index !== null && !cancelled) {
      const el = document.querySelector(anchors[index].href);
      if (el instanceof HTMLElement) {
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setActive(false);
    setIndex(null);
    setCancelled(false);
  };

  return (
    <>
      {/* Dims the page and blocks interaction with (and selection of)
          everything behind the menu while a drag is in progress. The
          gradient runs right-to-left, anchored at the button, so the
          page content stays visible (and its scroll position readable)
          underneath. Rendered outside the translated wrapper below so its
          fixed positioning resolves against the viewport, not the
          wrapper's transform. */}
      {active && (
        <div
          className="fixed inset-0 z-[54] select-none"
          style={{
            background: "linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)",
            touchAction: "none",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
          }}
          aria-hidden="true"
        />
      )}

      <div
        className={`md:hidden fixed right-4 top-1/2 -translate-y-1/2 z-[60] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {active && (
          <div
            ref={listRef}
            className="absolute right-[54px] top-1/2 -translate-y-1/2 flex flex-col items-end gap-[2px] py-[8px] pr-[8px] pl-[28px] select-none"
            style={{
              background: "linear-gradient(to left, rgba(0,0,0,0.55), rgba(0,0,0,0) 100%)",
              touchAction: "none",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
            }}
          >
            {anchors.map((a, i) => {
              const isSelected = i === index && !cancelled;
              return (
                <div
                  key={a.href}
                  className={`whitespace-nowrap uppercase font-[family-name:var(--font-body)] text-[16px] leading-normal rounded-[4px] border p-[4px] transition-colors duration-100 ${
                    isSelected
                      ? "text-[#0FD1EA] bg-[#0FD1EA]/10 border-[#0FD1EA]/20"
                      : "text-white border-transparent"
                  }`}
                >
                  {a.label}
                </div>
              );
            })}
          </div>
        )}

        <button
          ref={buttonRef}
          type="button"
          aria-label="Navigation rapide entre les sections"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => finish(true)}
          onPointerCancel={() => finish(false)}
          style={{ touchAction: "none", WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
          className={`select-none flex items-center justify-center w-[44px] h-[44px] transition-colors ${
            active ? "text-[#0FD1EA]" : "text-white"
          }`}
        >
          <CaretUpDownIcon />
        </button>
      </div>
    </>
  );
}
