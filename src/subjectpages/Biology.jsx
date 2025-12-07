import React, { useState } from 'react';
import '../Styles/Biology.css'; // Importing the CSS file

// Component for the dynamic (expandable) section on the left
const RevisionSection = ({ title, contentList, defaultOpen }) => {
  // Manage the open/closed state
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`revision-section ${isOpen ? 'open' : ''}`}>
      <div className="section-header" onClick={toggleSection}>
        <h3>{title}</h3>
        {/* Use the CSS to handle the rotation of the icon */}
        <span className="expand-icon">{isOpen ? '∧' : '∨'}</span> 
      </div>
      
      {/* The content only appears when isOpen is true, handled by CSS */}
      <div className="section-content">
        {contentList.map((item, index) => (
          <p key={index} className="content-item">{item}</p>
        ))}
      </div>
    </div>
  );
};

// Component for the static (always collapsed) sections on the right
const CollapsibleSection = ({ title }) => {
  // These sections are always closed, mirroring the image
  return (
    <div className="collapsible-section">
      <div className="section-header">
        <h3>{title}</h3>
        <span className="expand-icon">∨</span> 
      </div>
    </div>
  );
};

const EdexcelRevisionPage = () => {
  return (
    <div className="page-container">
      
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <span>Home / </span>
        <span>IGCSE / </span>
        <span>Biology / </span>
        <span>Edexcel / </span>
        **Revision Notes**
      </div>
      
      {/* Header Section */}
      <header className="page-header">
        <h1>Edexcel IGCSE Biology Revision Notes</h1>
        <p>Exam code: **4BI1**</p>
        <p>Concise resources for the Edexcel IGCSE Biology course.</p>
        <hr />
      </header>

      {/* Main Content Layout (Two Columns) */}
      <div className="main-content-grid">
        
        {/* Left Column: Section 1 */}
        <div className="grid-column">
          <h2>1. The Nature & Variety of Living Organisms</h2>
          
          <RevisionSection 
            title="Characteristics of Living Organisms"
            // Set this section to be open by default, matching the image
            defaultOpen={true}
            contentList={[
              "Characteristics of Living Organisms",
              "Common Features: Eukaryotic Organisms",
              "Common Features: Prokaryotic Organisms",
              "Pathogens"
            ]}
          />
        </div>
        
        {/* Right Column: Section 2 */}
        <div className="grid-column">
          <h2>2. Structure & Function in Living Organisms</h2>
          
          <CollapsibleSection title="Levels of Organisation" />
          <CollapsibleSection title="Cell Structure" />
          <CollapsibleSection title="Biological Molecules" />
          <CollapsibleSection title="Movement of Substances Into & Out of Cells" />
          <CollapsibleSection title="Nutrition" />
        </div>
        
      </div>
    </div>
  );
};

export default EdexcelRevisionPage;