import React, { useLayoutEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "../styles/DarkToggle.css";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useLayoutEffect(() => {
    const root = document.documentElement;

    root.classList.add("theme-switching");

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  }, [dark]);

  return (
    <button className="dark-toggle" onClick={() => setDark(d => !d)}>
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
