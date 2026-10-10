import React, { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Navigate, Routes, Route, useLocation, useParams } from "react-router-dom";
import TopNav from "./components/Navbar";
import Footer from "./components/Footer";
import DarkModeToggle from "./components/DarkModeToggle";
import ProgressStrip from "./components/ProgressStrip";
import AppNavigation from "./components/AppNavigation";
import StudentBreadcrumbs from "./components/StudentBreadcrumbs";
import RouteAnalytics from "./components/RouteAnalytics";
import RequireAccount from "./components/RequireAccount";
import HideFromTeachers from "./components/HideFromTeachers";
import LoadingState from "./components/LoadingState";
import SubjectActivityShell from "./components/SubjectActivityShell";
import "./index.css";
import "./styles/Academy.css";
import "./styles/DesignSystem.css";

import { AuthModalProvider } from "./context/AuthModalContext";
import LoginModal from "./components/LoginModal";

const ScienceSubject = lazy(() => import("./pages/ScienceSubject"));
const TopicHub = lazy(() => import("./pages/TopicHub"));
const CourseUnit = lazy(() => import("./pages/CourseUnit"));
const ScienceLessonReader = lazy(() => import("./pages/ScienceLessonReader"));
const PracticeSession = lazy(() => import("./pages/PracticeSession"));
const ExamQuestions = lazy(() => import("./pages/PracticeLibrary"));
const NotePage = lazy(() => import("./pages/NotePage"));
const StudentNotes = lazy(() => import("./pages/StudentNotes"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const FlashcardSubjects = lazy(() => import("./pages/FlashcardSubjects"));
const FlashcardChapters = lazy(() => import("./pages/FlashcardChapters"));
const MockExams = lazy(() => import("./pages/MockExams"));
const Hero = lazy(() => import("./pages/Hero"));
const Teachers = lazy(() => import("./pages/Teachers"));
const PastPapers = lazy(() => import("./pages/PastPapers"));
const SubjectNotesContent = lazy(() => import("./pages/SubjectNotesContent"));
const MarkdownNotePage = lazy(() => import("./pages/MarkdownNotePage"));
const MathLessonGroupReader = lazy(() => import("./pages/MathLessons").then((module) => ({ default: module.MathLessonGroupReader })));
const MathLessonIndex = lazy(() => import("./pages/MathLessons").then((module) => ({ default: module.MathLessonIndex })));
const MathLessonReader = lazy(() => import("./pages/MathLessons").then((module) => ({ default: module.MathLessonReader })));
const AccountDirectory = lazy(() => import("./pages/AccountDirectory"));
const AssignmentAnalytics = lazy(() => import("./pages/AssignmentAnalytics"));
const TeacherToolsShowcase = lazy(() => import("./pages/TeacherToolsShowcase"));
const TeacherContentTools = lazy(() => import("./pages/TeacherContentTools"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const RoleDashboard = lazy(() => import("./components/RoleDashboard"));
const Join = lazy(() => import("./pages/Join"));
const About = lazy(() => import("./pages/About"));

function LegacySubjectRedirect() {
  const { subject } = useParams();
  return <Navigate to={`/subjects/${subject}`} replace />;
}

function getPageTitle(pathname) {
  if (pathname === "/") return "kojonote";
  if (pathname.startsWith("/practice/") || pathname === "/examquestions") return "kojonote | Practice";
  if (pathname.startsWith("/mockexams")) return "kojonote | Mock Exams";
  if (pathname.startsWith("/notes")) return "kojonote | Notes";
  if (pathname === "/my-notes") return "kojonote | My Notes";
  if (pathname.startsWith("/flashcards")) return "kojonote | Flashcards";
  if (pathname.startsWith("/pastpapers")) return "kojonote | Past Papers";
  if (pathname.startsWith("/science/")) return "kojonote | Science";
  if (pathname.startsWith("/subjects/")) return "kojonote | Subject";
  if (pathname.startsWith("/learn/")) return "kojonote | Learning";
  if (pathname === "/launchpad") return "kojonote | Dashboard";
  if (pathname === "/ambassadors") return "kojonote | Ambassadors";
  if (pathname === "/join") return "kojonote | Join";
  if (pathname === "/about") return "kojonote | About";
  if (pathname === "/teacher-tools" || pathname.startsWith("/teachers")) return "kojonote | Teachers";
  if (pathname === "/settings") return "kojonote | Settings";
  return "kojonote";
}

export default function App() {
  const { pathname, search, hash, key: locationKey } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.scrollingElement?.scrollTo(0, 0);
      document.querySelectorAll(
        ".note-reader, [data-route-scroll]",
      ).forEach((element) => element.scrollTo(0, 0));
    };

    const finishNavigation = () => {
      const targetId = hash ? decodeURIComponent(hash.slice(1)) : "";
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) target.scrollIntoView({ block: "start", behavior: "auto" });
      else resetScroll();
    };

    resetScroll();
    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      resetScroll();
      secondFrame = window.requestAnimationFrame(resetScroll);
    });
    const postNavigationReset = window.setTimeout(finishNavigation, 100);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(postNavigationReset);
    };
  }, [pathname, search, hash, locationKey]);

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);
  const isFocusedSession = pathname.startsWith("/practice/");
  const isFlushLanding = pathname === "/"
    || pathname === "/teacher-tools"
    || pathname === "/notes"
    || pathname === "/flashcards"
    || (pathname === "/examquestions" && !new URLSearchParams(search).has("subject"));
  const notePathParts = pathname.split("/").filter(Boolean);
  const isScienceLessonReader = /^\/learn\/[^/]+\/[^/]+\/notes(?:\/|$)/.test(pathname);
  const isNoteReader = (pathname.startsWith("/notes/") && pathname !== "/notes/maths" && notePathParts.length >= 3) || isScienceLessonReader;
  const isFlashcardReader = /^\/flashcards\/[^/]+\/[^/]+$/.test(pathname);
  const isReaderLayout = isNoteReader || isFlashcardReader;
  const showProgress = pathname === "/launchpad";

  return (
    /* 🔹 Wrap the entire app */
    <AuthModalProvider>
      <>
        <div id="theme-fade" className="theme-fade" />
        <RouteAnalytics />

        <div className={`min-h-screen bg-rose-50/30${isReaderLayout ? " reader-layout" : ""}${isNoteReader ? " note-reader-layout" : ""}${isFlashcardReader ? " flashcard-reader-layout" : ""}`}>
          {!isFocusedSession && <TopNav />}
          {!isFocusedSession && <AppNavigation />}
          {showProgress && <ProgressStrip />}
          {!isFocusedSession && <StudentBreadcrumbs />}

          <div className={`app-route-stage${isFocusedSession || isFlushLanding ? " app-route-stage-flush" : ""}`}>
            <Suspense fallback={<main className="platform-shell"><LoadingState label="Loading kojonote" detail="Preparing this page" /></main>}><Routes>
            <Route path="/learn/:subject/:topic" element={<HideFromTeachers><CourseUnit /></HideFromTeachers>} />
            <Route path="/learn/:subject/:topic/notes" element={<HideFromTeachers><ScienceLessonReader /></HideFromTeachers>} />
            <Route path="/learn/:subject/:topic/notes/:section" element={<HideFromTeachers><ScienceLessonReader /></HideFromTeachers>} />
            <Route path="/" element={<Hero />} />
            <Route path="/ambassadors" element={<Navigate to="/join" replace />} />
            <Route path="/join" element={<Join />} />
            <Route path="/about" element={<About />} />
            <Route path="/launchpad" element={<RequireAccount><RoleDashboard /></RequireAccount>} />
            <Route path="/courses" element={<Navigate to="/subjects/maths" replace />} />
            <Route path="/subjects/:subject" element={<HideFromTeachers><ScienceSubject /></HideFromTeachers>} />
            <Route path="/science/:subject" element={<HideFromTeachers><LegacySubjectRedirect /></HideFromTeachers>} />
            <Route path="/science/:subject/:topic" element={<HideFromTeachers><TopicHub /></HideFromTeachers>} />
            <Route path="/practice/:subject/:topic" element={<HideFromTeachers><SubjectActivityShell><PracticeSession /></SubjectActivityShell></HideFromTeachers>} />
            <Route path="/examquestions" element={<HideFromTeachers><SubjectActivityShell><ExamQuestions /></SubjectActivityShell></HideFromTeachers>} />
            <Route path="/notes" element={<NotePage />} />
            <Route path="/notes/maths" element={<SubjectActivityShell><MathLessonIndex /></SubjectActivityShell>} />
            <Route path="/notes/maths/:year/group/:group/:note" element={<SubjectActivityShell><MathLessonGroupReader /></SubjectActivityShell>} />
            <Route path="/notes/maths/:year/group/:group" element={<SubjectActivityShell><MathLessonGroupReader /></SubjectActivityShell>} />
            <Route path="/notes/maths/:year/:lesson" element={<SubjectActivityShell><MathLessonReader /></SubjectActivityShell>} />
            <Route path="/notes/:id" element={<SubjectActivityShell><SubjectNotesContent /></SubjectActivityShell>} />
            <Route path="/notes/:subject/:topic" element={<SubjectActivityShell><MarkdownNotePage /></SubjectActivityShell>} />
            <Route path="/notes/:subject/:topic/:section" element={<SubjectActivityShell><MarkdownNotePage /></SubjectActivityShell>} />
            <Route path="/my-notes" element={<RequireAccount description="Your private notebook is available after you log in or create a student account."><HideFromTeachers><StudentNotes /></HideFromTeachers></RequireAccount>} />
            <Route path="/flashcards" element={<HideFromTeachers><FlashcardSubjects /></HideFromTeachers>} />
            <Route path="/flashcards/custom" element={<HideFromTeachers><Flashcards /></HideFromTeachers>} />
            <Route path="/flashcards/:subject" element={<HideFromTeachers><SubjectActivityShell><FlashcardChapters /></SubjectActivityShell></HideFromTeachers>} />
            <Route path="/flashcards/:subject/:chapter" element={<HideFromTeachers><SubjectActivityShell><Flashcards /></SubjectActivityShell></HideFromTeachers>} />
            <Route path="/mockexams" element={<HideFromTeachers><MockExams /></HideFromTeachers>} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/notes" element={<TeacherContentTools section="notes" />} />
            <Route path="/teachers/flashcards" element={<TeacherContentTools section="flashcards" />} />
            <Route path="/teachers/questions" element={<TeacherContentTools section="questions" />} />
            <Route path="/teacher-tools" element={<TeacherToolsShowcase />} />
            <Route path="/settings" element={<RequireAccount><AccountSettings /></RequireAccount>} />
            <Route path="/teachers/accounts" element={<AccountDirectory />} />
            <Route path="/teachers/assignments/:assignmentId" element={<AssignmentAnalytics />} />
            <Route path="/pastpapers" element={<HideFromTeachers><PastPapers /></HideFromTeachers>} />
            </Routes></Suspense>
          </div>

          <DarkModeToggle />
          {!isFocusedSession && !isNoteReader && !isFlashcardReader && <Footer />}
        </div>

        {/* 🔹 Global login dialog (renders above everything) */}
        <LoginModal />
      </>
    </AuthModalProvider>
  );
}
