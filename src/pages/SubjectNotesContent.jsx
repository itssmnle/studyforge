import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/SubjectNotesContent.css'; 
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
// Import data files
import biologyData from '../data/biology.json';
// ... import other subject data

// Map the subject ID to the data
const subjectDataMap = {
    'biology': biologyData,
    // ... add other subjects here
};

// --- ChapterCard Component (The individual expandable card) ---
const ChapterCard = ({ chapterData }) => {
    const [isOpen, setIsOpen] = useState(chapterData.isDefaultOpen || false);

    const toggleOpen = () => setIsOpen(!isOpen);
    
    // 💡 Logic to choose the icon based on the state
    const ArrowIcon = isOpen ? FiChevronUp : FiChevronDown; 

    return (
        <div className={`chapter-card ${isOpen ? 'open' : 'closed'}`}>
            <div className="card-header" onClick={toggleOpen}>
                <h3>{chapterData.chapterTitle}</h3>
                {/* 💡 Use the React Icon component */}
                <span className="expand-icon">
                    <ArrowIcon size={20} />
                </span>
            </div>
            
            {chapterData.subchapters && (
                <ul className="subchapters-list">
                    {chapterData.subchapters.map((subchapter, idx) => (
                        <li key={idx}>{subchapter}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
// ----------------------------------------------------------------
// ... (Rest of SubjectNotesContent.jsx code follows)
// ----------------------------------------------------------------

export default function SubjectNotesContent() {
  const { id } = useParams(); 
  const [notes, setNotes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setNotes(null);

    const loadSubjectData = async () => {
      const dataToLoad = subjectDataMap[id.toLowerCase()];

      if (!dataToLoad) {
        setError(`No data found for subject: ${id.toUpperCase()}`);
        setIsLoading(false);
        return;
      }
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500)); 

      try {
        setNotes(dataToLoad);
      } catch (e) {
        setError("An error occurred processing the notes data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjectData();
    
  }, [id]);

  // --- Rendering Logic ---

  if (isLoading) {
    return (
        <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading {id.toUpperCase()} notes...</p>
        </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }
  
  // Destructure the units for the two columns
  const unitOne = notes[0] || null;
  const unitTwo = notes[1] || null;

  return (
    <div className="notes-page-container">
      {/* Header Section (Based on image) */}
      <h1>Edexcel IGCSE {id.toUpperCase()} Revision Notes</h1>
      <p className="exam-code">Exam code: 4BI1</p>
      <p className="concise-text">Concise resources for the Edexcel IGCSE {id.toUpperCase()} course.</p>
      <hr className="header-separator" />
      
      {/* Main Two-Column Content Grid */}
      <div className="content-grid">
        
        {/* LEFT COLUMN (Unit 1) */}
        {unitOne && (
          <div className="unit-column">
            <h2>{unitOne.unitTitle}</h2>
            {unitOne.chapters.map((chapter, index) => (
              <ChapterCard key={index} chapterData={chapter} />
            ))}
          </div>
        )}

        {/* RIGHT COLUMN (Unit 2) */}
        {unitTwo && (
          <div className="unit-column">
            <h2>{unitTwo.unitTitle}</h2>
            {unitTwo.chapters.map((chapter, index) => (
              <ChapterCard key={index} chapterData={chapter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}