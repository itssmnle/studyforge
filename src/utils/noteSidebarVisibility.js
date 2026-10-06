import { useState } from "react";

const STORAGE_KEY = "studyforge.note-sidebar-hidden";

const readHidden = (storageKey) => typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "true";

export function useNoteSidebarVisibility(storageKey = STORAGE_KEY) {
  const [hidden, setHidden] = useState(() => readHidden(storageKey));
  const toggle = () => setHidden((current) => {
    const next = !current;
    window.sessionStorage.setItem(storageKey, String(next));
    return next;
  });
  return [hidden, toggle];
}
