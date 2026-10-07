export const scienceSubjects = [
  {
    id: "biology",
    name: "Biology",
    qualification: "KS3",
    color: "#16805b",
    secondaryColor: "#cdeedd",
    description: "Living systems, from cells to ecosystems.",
    topics: [
      { id: "year-9-chacteristics-of-living-beings", name: "Characteristics of Living Beings", subtopics: ["Seven life processes (MRS GREN)", "Respiration vs breathing", "Excretion vs egestion"] },
      { id: "year-9-cells-and-organisation", name: "Cells and Organisation", subtopics: ["Cell structure and organelles", "Specialised cells and magnification", "Levels of organisation"] },
      { id: "year-9-movement-into-and-out-of-cells", name: "Movement into and out of Cells", subtopics: ["Diffusion", "Osmosis and water potential", "Active transport"] },
      { id: "year-9-biological-molecules", name: "Biological Molecules", subtopics: ["Elements in nutrients (C, H, O, N)", "Building blocks of large molecules", "Biochemical food tests"] },
      { id: "year-9-enzymes", name: "Enzymes", subtopics: ["Lock and Key model", "Factors affecting activity (temperature and pH)", "Denaturation and digestive enzymes"] }
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    qualification: "KS3",
    color: "#1c6787",
    secondaryColor: "#d4edf5",
    description: "Matter, reactions, energy and the materials around us.",
    topics: [
      { id: "year-9-states-of-matter", name: "States of Matter", subtopics: ["Particle model and state changes", "Heating and cooling curves", "Gas pressure and diffusion rates"] },
      { id: "year-9-atoms-and-isotopes", name: "Atoms and Isotopes", subtopics: ["Subatomic particles and atomic structure", "Electronic configurations (1–20)", "Isotopes and ions"] },
      { id: "year-9-chemical-bonding", name: "Chemical Bonding", subtopics: ["Ionic bonding and giant lattices", "Covalent bonding and simple molecules", "Giant covalent structures and metallic bonding"] }
    ]
  },
  {
    id: "physics",
    name: "Physics",
    qualification: "KS3",
    color: "#bb5a1d",
    secondaryColor: "#f9dfcc",
    description: "Energy, forces, matter and how the universe behaves.",
    topics: [
      { id: "year-9-motion-and-forces", name: "Motion and Forces", subtopics: ["Speed, velocity and acceleration", "Distance–time and speed–time graphs", "Resultant forces and Newton's laws (F = ma)"] },
      { id: "year-9-energy-and-work", name: "Energy and Work", subtopics: ["Energy stores and transfer pathways", "Kinetic and gravitational potential energy", "Work done and conservation of energy"] }
    ]
  }
];

export const findSubject = (subjectId) =>
  scienceSubjects.find((subject) => subject.id === subjectId);

export const findTopic = (subjectId, topicId) =>
  findSubject(subjectId)?.topics.find((topic) => topic.id === topicId);
