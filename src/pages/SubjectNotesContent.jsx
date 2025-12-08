import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/SubjectNotesContent.css'; 
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Import data files
import biologyData from '../data/biology.json';
import chemistryData from '../data/chemistry.json';
import physicsData from '../data/physics.json';
import mathsData from '../data/mathematics.json';
import historyData from '../data/history.json';
import geographyData from '../data/geography.json';
import businessData from '../data/business.json';
// ... import other subject data

// Map the subject ID to the data
const subjectDataMap = {
    'biology': biologyData,
    'chemistry': chemistryData,
    'physics': physicsData,
    'maths': mathsData,
    'history': historyData,
    'geography': geographyData,
    'business': businessData
};

// --- ChapterCard Component ---
const ChapterCard = ({ chapterData }) => {
    const [isOpen, setIsOpen] = useState(chapterData.isDefaultOpen || false);

    const toggleOpen = () => setIsOpen(!isOpen);
    const ArrowIcon = isOpen ? FiChevronUp : FiChevronDown;

    return (
        <div className={`chapter-card ${isOpen ? 'open' : ''}`}>
            <div className="card-header" onClick={toggleOpen}>
                <h3>{chapterData.chapterTitle}</h3>
                <span className="expand-icon">
                    <ArrowIcon size={20} />
                </span>
            </div>
            <ul className={`subchapters-list ${isOpen ? "open" : ""}`}>
                {chapterData.subchapters?.map((subchapter, idx) => (
                    <li key={idx}>{subchapter}</li>
                ))}
            </ul>
        </div>
    );
};

// --- SubjectNotesContent Component ---
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

            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 300));

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

    // --- Loading & Error States ---
    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>loading {id.toLowerCase()} notes...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    }

    return (
      <div className="notes-page-container">
        {/* Header */}
        <h1>Edexcel IGCSE {id.toUpperCase()} Revision Notes</h1>
        <p className="exam-code">Exam code: 4BI1</p>
        <p className="concise-text">Concise resources for the Edexcel IGCSE {id.toUpperCase()} course.</p>
        <hr className="header-separator" />

        {/* TWO COLUMN GRID */}
        <div className="content-grid">
          {/* LEFT COLUMN: Units with even index */}
          <div className="unit-column">
            {notes.filter((_, idx) => idx % 2 === 0).map((unit, unitIndex) => (
              <div className="unit-card" key={unitIndex}>
                <h2>{unit.unitTitle}</h2>
                {unit.chapters.map((chapter, idx) => (
                  <ChapterCard key={idx} chapterData={chapter} />
                ))}
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Units with odd index */}
          <div className="unit-column">
            {notes.filter((_, idx) => idx % 2 !== 0).map((unit, unitIndex) => (
              <div className="unit-card" key={unitIndex}>
                <h2>{unit.unitTitle}</h2>
                {unit.chapters.map((chapter, idx) => (
                  <ChapterCard key={idx} chapterData={chapter} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

    );
}
