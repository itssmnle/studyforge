import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "../styles/DarkToggle.css";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button className="dark-toggle" onClick={() => setDark(!dark)}>
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}