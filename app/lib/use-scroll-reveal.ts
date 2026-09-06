"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * useScrollReveal — attaches to a container ref; returns a CSS class
 * that toggles between invisible and visible as the element enters viewport.
 *
 * Usage:
 *   const { ref, cls } = useScrollReveal();
 *   <div ref={ref} className={cls("my-base-class")}>…</div>
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.12,
    rootMargin = "0px 0px -60px 0px",
    once = true,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  /**
   * cls(base, delayMs?) — merges base classes with reveal transition classes.
   * The element starts as opacity-0 / translate-y-8 and transitions to visible.
   */
  const cls = (base = "", delayMs = 0): string => {
    const transition = `transition-all duration-700 ease-out`;
    const delay = delayMs ? `delay-[${delayMs}ms]` : "";
    const hidden = "opacity-0 translate-y-8";
    const shown = "opacity-100 translate-y-0";
    return `${base} ${transition} ${delay} ${visible ? shown : hidden}`.trim();
  };

  return { ref, visible, cls };
}

/**
 * useScrollRevealList — for lists of N items that should stagger in sequence.
 *
 * Usage:
 *   const { containerRef, itemCls } = useScrollRevealList(4);
 *   <div ref={containerRef}>
 *     {items.map((item, i) => (
 *       <div className={itemCls(i)}>…</div>
 *     ))}
 *   </div>
 */
export function useScrollRevealList(
  count: number,
  staggerMs = 100,
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.08, rootMargin = "0px 0px -40px 0px", once = true } =
    options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, count]);

  const itemCls = (index: number, base = ""): string => {
    const delay = index * staggerMs;
    const transition = "transition-all duration-700 ease-out";
    const style = visible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-8";
    return `${base} ${transition} ${style}`.trim();
  };

  const itemStyle = (index: number): React.CSSProperties => ({
    transitionDelay: visible ? `${index * staggerMs}ms` : "0ms",
  });

  return { containerRef, visible, itemCls, itemStyle };
}
