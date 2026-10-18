import { useEffect, useState } from "react";

/** True when the viewport is desktop-width (default >= 1024px). Reactive to resizes. */
export function useIsDesktop(min = 1024) {
  const [is, setIs] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(min-width: ${min}px)`).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`);
    const fn = (e: MediaQueryListEvent) => setIs(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [min]);

  return is;
}
