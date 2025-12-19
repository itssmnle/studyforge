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
import Hero from "./pages/Hero";
import Teachers from "./pages/Teachers";
import PastPapers from "./pages/PastPapers";
import SubjectNotesContent from "./pages/SubjectNotesContent";
import "./index.css";

/* 🔹 NEW imports */
import { AuthModalProvider } from "./context/AuthModalContext";
import LoginModal from "./components/LoginModal";

export default function App() {
  return (
    /* 🔹 Wrap the entire app */
    <AuthModalProvider>
      <>
        <div id="theme-fade" className="theme-fade" />

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
          </Routes>

          <DarkModeToggle />
          <Footer />
        </div>

        {/* 🔹 Global login dialog (renders above everything) */}
        <LoginModal />
      </>
    </AuthModalProvider>
  );
}
