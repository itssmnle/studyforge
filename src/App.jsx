import React from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./components/Navbar";
import Footer from "./components/Footer";
import DarkModeToggle from "./components/DarkModeToggle";
import Launchpad from "./pages/Launchpad";
import Courses from "./pages/Courses";
import NotePage from "./pages/NotePage";
import Flashcards from "./pages/Flashcards";
import Games from "./pages/Games";
import Hero from "./pages/Hero"
import Teachers from "./pages/Teachers"

// 1. Import the new component
import SubjectNotesContent from "./pages/SubjectNotesContent";
import "./index.css";

export default function App(){
  return (
    <div className="min-h-screen bg-rose-50/30">
      <TopNav />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/launchpad" element={<Launchpad />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/notes" element={<NotePage />} />
        <Route path="/notes/:id" element={<SubjectNotesContent />} /> 
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/games" element={<Games />} />
        <Route path="/teachers" element={<Teachers />} />
        {/*subject pages*/}
      </Routes>
      <DarkModeToggle /> {/* floating button */}
      <Footer />
    </div>
    
  )
}