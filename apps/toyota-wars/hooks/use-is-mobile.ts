"use client";

import { useEffect, useState } from "react";

export type ViewportMode = {
  isMobile: boolean;
  isPortrait: boolean;
  isTouch: boolean;
};

const MOBILE_QUERY = "(max-width: 920px), (pointer: coarse)";
const TOUCH_QUERY = "(pointer: coarse)";
const PORTRAIT_QUERY = "(orientation: portrait)";

const INITIAL_MODE: ViewportMode = {
  isMobile: false,
  isPortrait: false,
  isTouch: false,
};

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>(INITIAL_MODE);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const touch = window.matchMedia(TOUCH_QUERY);
    const portrait = window.matchMedia(PORTRAIT_QUERY);

    const update = () =>
      setMode({
        isMobile: mobile.matches,
        isTouch: touch.matches,
        isPortrait: portrait.matches,
      });

    update();
    mobile.addEventListener("change", update);
    touch.addEventListener("change", update);
    portrait.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      touch.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
    };
  }, []);

  return mode;
}
