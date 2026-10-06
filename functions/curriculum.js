export const scienceSubjects = [
  {
    id: "biology",
    name: "Biology",
    qualification: "KS4",
    color: "#218a62",
    description: "Living systems, from cells to ecosystems.",
    topics: [
      { id: "cells-and-organisation", name: "Cells and Organisation", subtopics: ["Cell structure", "Transport and specialisation", "Levels of organisation"] },
      { id: "body-systems-and-movement", name: "Body Systems and Movement", subtopics: ["The skeleton", "Joints", "Muscles and movement"] },
      { id: "nutrition-digestion-and-health", name: "Nutrition, Digestion, and Health", subtopics: ["Balanced diet", "Digestion and enzymes", "Health and lifestyle"] },
      { id: "gas-exchange-and-respiration", name: "Gas Exchange and Respiration", subtopics: ["Gas exchange", "Aerobic respiration", "Anaerobic respiration"] },
      { id: "ecosystems-and-photosynthesis", name: "Ecosystems and Photosynthesis", subtopics: ["Ecosystems", "Photosynthesis", "Adaptations and interdependence"] },
      { id: "reproduction", name: "Reproduction", subtopics: ["Human reproduction", "The menstrual cycle", "Plant reproduction"] },
      { id: "genetics-evolution-and-variation", name: "Genetics, Evolution, and Variation", subtopics: ["DNA and inheritance", "Variation", "Evolution and biodiversity"] },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    qualification: "KS4",
    color: "#5b57c8",
    description: "Matter, reactions, energy and the materials around us.",
    topics: [
      { id: "particle-model", name: "The Particle Model", subtopics: ["Particle arrangement", "Changes of state", "Diffusion and density"] },
      { id: "atoms-elements-and-compounds", name: "Atoms, Elements, and Compounds", subtopics: ["Atomic structure", "Elements and compounds", "Chemical formulae"] },
      { id: "pure-and-impure-substances", name: "Pure and Impure Substances", subtopics: ["Pure substances", "Mixtures", "Separating mixtures"] },
      { id: "periodic-table", name: "The Periodic Table", subtopics: ["Periodic table structure", "Groups and periods", "Metals and non-metals"] },
      { id: "chemical-reactions", name: "Chemical Reactions", subtopics: ["Reactants and products", "Conservation of mass", "Reaction types"] },
      { id: "chemical-energy", name: "Chemical Energy", subtopics: ["Exothermic reactions", "Endothermic reactions", "Energy changes"] },
      { id: "materials-and-reactivity", name: "Materials and Reactivity", subtopics: ["The reactivity series", "Metal extraction", "Modern materials"] },
      { id: "earth-and-atmosphere", name: "Earth and Atmosphere", subtopics: ["Earth structure", "The atmosphere", "Climate change"] },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    qualification: "KS4",
    color: "#d27b19",
    description: "Energy, forces, matter and how the universe behaves.",
    topics: [
      { id: "forces-and-motion", name: "Forces and Motion", subtopics: ["Describing motion", "Forces", "Moments and pressure"] },
      { id: "energy", name: "Energy", subtopics: ["Energy stores and transfers", "Work and power", "Heating and energy use"] },
      { id: "waves", name: "Waves", subtopics: ["Wave properties", "Sound", "Light and colour"] },
      { id: "electricity-and-electromagnetism", name: "Electricity and Electromagnetism", subtopics: ["Static electricity", "Circuits", "Electromagnets"] },
      { id: "space-physics", name: "Space Physics", subtopics: ["Earth, Sun, and Moon", "Seasons", "Solar System and beyond"] },
    ],
  },
];

export const findSubject = (subjectId) =>
  scienceSubjects.find((subject) => subject.id === subjectId);

export const findTopic = (subjectId, topicId) =>
  findSubject(subjectId)?.topics.find((topic) => topic.id === topicId);
