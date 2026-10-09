export const scienceSubjects = [
  {
    id: "biology",
    name: "Biology",
    qualification: "KS3",
    color: "#16805b",
    secondaryColor: "#cdeedd",
    description: "Living systems, from cells to ecosystems.",
    topics: [
      { id: "year-7-cells-and-organisation", name: "Cells and Organisation", description: "Microscopes, cell structures, specialised cells, diffusion, and levels of organisation.", subtopics: [] },
      { id: "year-7-skeletal-and-muscular-systems", name: "Skeletal and Muscular Systems", description: "Bones, joints, tendons, ligaments, antagonistic muscles, and moments.", subtopics: [] },
      { id: "year-8-nutrition-and-digestion", name: "Nutrition and Digestion", description: "Balanced diets, nutrients, deficiency diseases, digestion, and absorption by villi.", subtopics: [] },
      { id: "year-8-gas-exchange-systems", name: "Gas Exchange Systems", description: "Ventilation, alveoli adaptations, gas exchange, and the effects of smoking.", subtopics: [] },
      { id: "year-8-photosynthesis", name: "Photosynthesis", description: "The photosynthesis equation, leaf structure, gas exchange, and starch testing.", subtopics: [] },
      { id: "year-8-respiration", name: "Respiration", description: "Aerobic and anaerobic respiration, energy release, fermentation, and carbon dioxide testing.", subtopics: [] },
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
      { id: "year-7-particle-model", name: "Particle Model", description: "Particle arrangements, states of matter, changes of state, diffusion, and gas pressure.", subtopics: [] },
      { id: "year-7-atoms-elements-and-compounds", name: "Atoms, Elements and Compounds", description: "Atomic structure, elements, compounds, mixtures, and chemical formulae.", subtopics: [] },
      { id: "year-7-pure-and-impure-substances", name: "Pure and Impure Substances", description: "Pure substances, mixtures, filtration, crystallisation, distillation, and chromatography.", subtopics: [] },
      { id: "year-8-chemical-reactions", name: "Chemical Reactions", description: "Reaction evidence, combustion, decomposition, acids, alkalis, and conservation of mass.", subtopics: [] },
      { id: "year-8-periodic-table", name: "Periodic Table", description: "Groups, periods, Group 1 metals, Group 7 halogens, and Group 0 noble gases.", subtopics: [] },
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
      { id: "year-7-energy", name: "Energy", description: "Energy stores, transfer pathways, power, efficiency, and energy resources.", subtopics: [] },
      { id: "year-7-speed", name: "Speed", description: "Speed calculations, distance-time graphs, gradients, and journeys.", subtopics: [] },
      { id: "year-7-forces", name: "Forces", description: "Balanced forces, resultant motion, Hooke's law, and work done.", subtopics: [] },
      { id: "year-8-electricity-in-circuits", name: "Electricity in Circuits", description: "Current, voltage, resistance, series circuits, parallel circuits, and circuit measurements.", subtopics: [] },
      { id: "year-8-sound-and-light", name: "Sound and Light", description: "Transverse and longitudinal waves, sound, reflection, refraction, and light speed.", subtopics: [] },
      { id: "year-9-motion-and-forces", name: "Motion and Forces", subtopics: ["Speed, velocity and acceleration", "Distance–time and speed–time graphs", "Resultant forces and Newton's laws (F = ma)"] },
      { id: "year-9-energy-and-work", name: "Energy and Work", subtopics: ["Energy stores and transfer pathways", "Kinetic and gravitational potential energy", "Work done and conservation of energy"] }
    ]
  }
];

export const findSubject = (subjectId) =>
  scienceSubjects.find((subject) => subject.id === subjectId);

export const findTopic = (subjectId, topicId) =>
  findSubject(subjectId)?.topics.find((topic) => topic.id === topicId);
