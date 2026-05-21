"use client";

import { useEffect, useRef } from "react";

const FRAME_COUNT = 6;
const WHEEL_LOCK_MS = 320;
const WHEEL_MIN_DELTA = 3;
const TOUCH_THRESHOLD_PX = 34;

function getCurrentFrameIndex(section: HTMLElement) {
  const counter = Array.from(section.querySelectorAll("p"))
    .map((node) => node.textContent?.trim() || "")
    .find((text) => /^\d{2}\s\/\s06$/.test(text));

  const parsed = Number(counter?.slice(0, 2));
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= FRAME_COUNT) return parsed - 1;

  const images = Array.from(section.querySelectorAll<HTMLImageElement>("img"));
  const activeImageIndex = images.findIndex((image) => {
    const opacity = image.style.opacity || window.getComputedStyle(image).opacity;
    return Number(opacity) > 0.5;
  });

  return activeImageIndex >= 0 ? activeImageIndex : 0;
}

function clickFrameButton(section: HTMLElement, direction: 1 | -1) {
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>("button, a"));
  const labels = direction === 1 ? ["Nästa bild", "Next image"] : ["Föregående", "Previous"];
  const button = buttons.find((item) => {
    const text = item.textContent || "";
    return labels.some((label) => text.includes(label));
  });
  if (!button) return false;
  button.click();
  return true;
}

export default function CinematicFrameLock() {
  const wheelLocked = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const foundSection = document.querySelector<HTMLElement>("main > #cinematic-scroll");
    if (!foundSection) return;
    const section: HTMLElement = foundSection;

    function getBoundary(direction: 1 | -1) {
      const index = getCurrentFrameIndex(section);
      return {
        index,
        atFirst: index <= 0,
        atLast: index >= FRAME_COUNT - 1,
        canStep: direction === 1 ? index < FRAME_COUNT - 1 : index > 0
      };
    }

    function step(direction: 1 | -1) {
      const boundary = getBoundary(direction);
      if (wheelLocked.current || !boundary.canStep) return false;
      wheelLocked.current = true;
      const clicked = clickFrameButton(section, direction);
      window.setTimeout(() => {
        wheelLocked.current = false;
      }, WHEEL_LOCK_MS);
      return clicked;
    }

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < WHEEL_MIN_DELTA) return;
      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      const boundary = getBoundary(direction);

      // At frame 1 + scroll up, or frame 6 + scroll down: release the page normally.
      if (!boundary.canStep) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      step(direction);
    }

    function onTouchStart(event: TouchEvent) {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    }

    function onTouchMove(event: TouchEvent) {
      if (touchStartY.current === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - currentY;
      if (Math.abs(delta) < 10) return;

      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      const boundary = getBoundary(direction);
      if (!boundary.canStep) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function onTouchEnd(event: TouchEvent) {
      if (touchStartY.current === null) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - endY;
      touchStartY.current = null;

      if (Math.abs(delta) < TOUCH_THRESHOLD_PX) return;
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      const boundary = getBoundary(direction);
      if (!boundary.canStep) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      step(direction);
    }

    section.addEventListener("wheel", onWheel, { capture: true, passive: false });
    section.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    section.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    section.addEventListener("touchend", onTouchEnd, { capture: true, passive: false });

    return () => {
      section.removeEventListener("wheel", onWheel, { capture: true });
      section.removeEventListener("touchstart", onTouchStart, { capture: true });
      section.removeEventListener("touchmove", onTouchMove, { capture: true });
      section.removeEventListener("touchend", onTouchEnd, { capture: true });
    };
  }, []);

  return null;
}
