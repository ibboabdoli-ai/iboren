"use client";

import { useEffect } from "react";

function initialsFromProfile() {
  const title = document.querySelector("aside h1.display")?.textContent?.trim() || "";
  const words = title.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return initials || "IA";
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

function polishAvatar(img: HTMLImageElement) {
  if (img.dataset.iborenAvatarPolished === "1") return;
  img.dataset.iborenAvatarPolished = "1";
  img.referrerPolicy = "no-referrer";

  img.addEventListener("error", () => {
    if (!img.dataset.iborenAvatarRetried && img.src) {
      img.dataset.iborenAvatarRetried = "1";
      const src = img.src;
      window.setTimeout(() => {
        img.referrerPolicy = "no-referrer";
        img.src = src;
      }, 80);
      return;
    }

    showFallback(img);
  });

  if (img.complete && img.naturalWidth === 0) showFallback(img);
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
