"use client";

import { useEffect } from "react";

function initialsFromProfile() {
  const title = document.querySelector("aside h1.display")?.textContent?.trim() || "";
  const words = title.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return initials || "IA";
}

function isGoogleAvatar(src: string) {
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (host === "googleusercontent.com" || host.endsWith(".googleusercontent.com"));
  } catch {
    return false;
  }
}

function avatarProxySrc(src: string) {
  return `/api/avatar-proxy?url=${encodeURIComponent(src)}`;
}

function showFallback(img: HTMLImageElement) {
  if (img.dataset.iborenAvatarFallback === "1") return;
  img.dataset.iborenAvatarFallback = "1";

  const fallback = document.createElement("div");
  fallback.dataset.iborenAvatarInitials = "1";
  fallback.className = img.className;
  fallback.classList.add("grid", "place-items-center", "bg-[#49D8EA]/15", "text-[#49D8EA]", "text-xl", "font-black", "uppercase");
  fallback.textContent = initialsFromProfile();

  img.insertAdjacentElement("afterend", fallback);
  img.style.display = "none";
}

function tryProxy(img: HTMLImageElement) {
  const originalSrc = img.dataset.iborenAvatarOriginalSrc || img.src;
  if (!originalSrc || !isGoogleAvatar(originalSrc) || img.dataset.iborenAvatarProxyTried === "1") return false;

  img.dataset.iborenAvatarProxyTried = "1";
  img.dataset.iborenAvatarOriginalSrc = originalSrc;
  img.referrerPolicy = "no-referrer";
  img.src = avatarProxySrc(originalSrc);
  return true;
}

function polishAvatar(img: HTMLImageElement) {
  if (img.dataset.iborenAvatarPolished === "1") return;
  img.dataset.iborenAvatarPolished = "1";
  img.dataset.iborenAvatarOriginalSrc = img.src;
  img.referrerPolicy = "no-referrer";
  img.crossOrigin = "anonymous";

  if (isGoogleAvatar(img.src)) {
    const originalSrc = img.src;
    window.setTimeout(() => {
      if (img.complete && img.naturalWidth > 0) return;
      if (img.src === originalSrc) tryProxy(img);
    }, 450);
  }

  img.addEventListener("error", () => {
    if (tryProxy(img)) return;
    showFallback(img);
  });

  if (img.complete && img.naturalWidth === 0) {
    if (!tryProxy(img)) showFallback(img);
  }
}

export default function ProfileAvatarPolish() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLImageElement>('img[alt="Profilbild"]').forEach(polishAvatar);
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
