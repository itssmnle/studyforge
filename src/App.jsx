import React from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./components/Navbar";
import Footer from "./components/Footer";
import DarkModeToggle from "./components/DarkModeToggle";
import Launchpad from "./pages/Launchpad";
import ExamQuestions from "./pages/ExamQuestions";
import NotePage from "./pages/NotePage";
import Flashcards from "./pages/Flashcards";
import MockExams from "./pages/MockExams";
import Hero from "./pages/Hero"
import Teachers from "./pages/Teachers"
import PastPapers from "./pages/PastPapers";

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
        <Route path="/examquestions" element={<ExamQuestions />} />
        <Route path="/notes" element={<NotePage />} />
        <Route path="/notes/:id" element={<SubjectNotesContent />} /> 
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/mockexams" element={<MockExams />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/pastpapers" element={<PastPapers />} />
        {/*subject pages*/}
      </Routes>
      <DarkModeToggle /> {/* floating button */}
      <Footer />
    </div>
    
  )
}