import { useEffect, useState } from "react";
import katex from "katex";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { scienceGlossary } from "../data/scienceGlossary";
import { mathsGlossary } from "../data/mathsGlossary";

const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\$(?:\\.|[^$\\\n])*\$)/g;
const blockImagePattern = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+["']([^"']+)["'])?\)$/;
const glossaries = { science: scienceGlossary, maths: mathsGlossary };
const localMathImages = Object.fromEntries(Object.entries(import.meta.glob("../../content/maths-images/**/*.{svg,png,jpg,jpeg,webp}", { query: "?url", import: "default", eager: true })).map(([path, url]) => [`/maths-images/${path.split("/maths-images/")[1]}`, url]));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const positionGlossaryTooltip = event => {
  const term = event.currentTarget;
  const tooltip = term.querySelector(".glossary-tooltip");
  const reader = term.closest(".note-reader");
  if (!tooltip) return;
  const termRect = term.getBoundingClientRect();
  const tooltipWidth = tooltip.getBoundingClientRect().width;
  const rightBoundary = Math.min(reader?.getBoundingClientRect().right ?? window.innerWidth, window.innerWidth) - 12;
  term.classList.toggle("glossary-align-left", termRect.left + tooltipWidth > rightBoundary);
};

function MathExpression({ value, display = false }) {
  const html = katex.renderToString(value, {
    displayMode: display,
    throwOnError: false,
    strict: "ignore",
    trust: false,
    output: "htmlAndMathml",
  });
  const Element = display ? "div" : "span";
  return <Element className={display ? "math-expression math-display" : "math-expression"} aria-label={value} dangerouslySetInnerHTML={{ __html: html }} />;
}

const renderGlossaryText = (text, keyPrefix, seenTerms, glossaryEntries) => {
  const rendered = [];
  let remaining = text;
  let offset = 0;

  while (remaining) {
    let next = null;
    glossaryEntries.forEach(([term, definition]) => {
      if (seenTerms.has(term)) return;
      const match = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").exec(remaining);
      if (match && (!next || match.index < next.index || (match.index === next.index && term.length > next.term.length))) {
        next = { term, definition, index: match.index, text: match[0] };
      }
    });

    if (!next) {
      rendered.push(remaining);
      break;
    }
    if (next.index > 0) rendered.push(remaining.slice(0, next.index));
    seenTerms.add(next.term);
    rendered.push(
      <span className="glossary-term" tabIndex="0" onMouseEnter={positionGlossaryTooltip} onFocus={positionGlossaryTooltip} key={`${keyPrefix}-term-${offset}`}>
        {next.text}<span className="glossary-question" aria-hidden="true">?</span>
        <span className="glossary-tooltip" role="tooltip"><span className="glossary-tooltip-title">{next.text}</span>{next.definition}</span>
      </span>,
    );
    offset += next.index + next.text.length;
    remaining = remaining.slice(next.index + next.text.length);
  }
  return rendered;
};

const renderInline = (text, keyPrefix, seenTerms, glossaryEntries, allowGlossary = true) => text.split(inlinePattern).filter(Boolean).map((part, index) => {
  const key = `${keyPrefix}-${index}`;
  if (part.startsWith("**") && part.endsWith("**")) return <strong key={key}>{renderInline(part.slice(2, -2), `${key}-strong`, seenTerms, glossaryEntries, allowGlossary)}</strong>;
  if (part.startsWith("`") && part.endsWith("`")) return <code key={key}>{part.slice(1, -1)}</code>;
  if (part.startsWith("$") && part.endsWith("$")) return <MathExpression key={key} value={part.slice(1, -1)} />;
  const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (link) return <a key={key} href={link[2]} target={link[2].startsWith("http") ? "_blank" : undefined} rel="noreferrer">{link[1]}</a>;
  return <span key={key}>{allowGlossary ? renderGlossaryText(part, key, seenTerms, glossaryEntries) : part}</span>;
});

const isDividerRow = (line) => /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line);
const tableCells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
const headingId = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const safeImageSource = (source) => source.startsWith("/") || /^https:\/\//i.test(source);

const wikimediaDiagram = (fileName) => `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=1200`;
const onlinePlaceholderImages = {
  "/note-images/biology/cell-structure.png": wikimediaDiagram("Animal_cell_structure_en.svg"),
  "/note-images/biology/transport-and-specialisation.png": wikimediaDiagram("Animal_cell_structure_en.svg"),
  "/note-images/biology/levels-of-organisation.png": wikimediaDiagram("Animal_cell_structure_en.svg"),
  "/note-images/biology/the-skeleton.png": wikimediaDiagram("Human_skeleton_front_en.svg"),
  "/note-images/biology/joints.png": wikimediaDiagram("Human_skeleton_front_en.svg"),
  "/note-images/biology/muscles-and-movement.png": wikimediaDiagram("Human_skeleton_front_en.svg"),
  "/note-images/biology/balanced-diet.png": wikimediaDiagram("Digestive_system_diagram_edit.svg"),
  "/note-images/biology/digestion-and-enzymes.png": wikimediaDiagram("Digestive_system_diagram_edit.svg"),
  "/note-images/biology/health-and-lifestyle.png": wikimediaDiagram("Digestive_system_diagram_edit.svg"),
  "/note-images/biology/gas-exchange.png": wikimediaDiagram("Respiratory_system_complete_en.svg"),
  "/note-images/biology/aerobic-respiration.png": wikimediaDiagram("Respiratory_system_complete_en.svg"),
  "/note-images/biology/anaerobic-respiration.png": wikimediaDiagram("Respiratory_system_complete_en.svg"),
  "/note-images/biology/ecosystems.png": wikimediaDiagram("Simple_photosynthesis_overview.svg"),
  "/note-images/biology/photosynthesis.png": wikimediaDiagram("Simple_photosynthesis_overview.svg"),
  "/note-images/biology/adaptations-and-interdependence.png": wikimediaDiagram("Simple_photosynthesis_overview.svg"),
  "/note-images/biology/human-reproduction.png": wikimediaDiagram("Scheme_female_reproductive_system-en.svg"),
  "/note-images/biology/menstrual-cycle.png": wikimediaDiagram("Scheme_female_reproductive_system-en.svg"),
  "/note-images/biology/plant-reproduction.png": wikimediaDiagram("Scheme_female_reproductive_system-en.svg"),
  "/note-images/biology/dna-and-inheritance.png": wikimediaDiagram("Chromosome.svg"),
  "/note-images/biology/variation.png": wikimediaDiagram("Chromosome.svg"),
  "/note-images/biology/evolution-and-biodiversity.png": wikimediaDiagram("Chromosome.svg"),
  "/note-images/chemistry/particle-arrangement.png": wikimediaDiagram("States_of_matter_En.svg"),
  "/note-images/chemistry/changes-of-state.png": wikimediaDiagram("States_of_matter_En.svg"),
  "/note-images/chemistry/diffusion-and-density.png": wikimediaDiagram("States_of_matter_En.svg"),
  "/note-images/chemistry/atomic-structure.png": wikimediaDiagram("Bohr_atom_model.svg"),
  "/note-images/chemistry/elements-and-compounds.png": wikimediaDiagram("Bohr_atom_model.svg"),
  "/note-images/chemistry/chemical-formulae.png": wikimediaDiagram("Reaction1.png"),
  "/note-images/chemistry/pure-substances.png": wikimediaDiagram("Simple_distillation_apparatus.svg"),
  "/note-images/chemistry/mixtures.png": wikimediaDiagram("Simple_distillation_apparatus.svg"),
  "/note-images/chemistry/separating-mixtures.png": wikimediaDiagram("Simple_distillation_apparatus.svg"),
  "/note-images/chemistry/periodic-table-structure.png": wikimediaDiagram("Periodic_table_large.svg"),
  "/note-images/chemistry/groups-and-periods.png": wikimediaDiagram("Periodic_table_large.svg"),
  "/note-images/chemistry/metals-and-non-metals.png": wikimediaDiagram("Periodic_table_large.svg"),
  "/note-images/chemistry/reactants-and-products.png": wikimediaDiagram("Reaction1.png"),
  "/note-images/chemistry/conservation-of-mass.png": wikimediaDiagram("Reaction1.png"),
  "/note-images/chemistry/reaction-types.png": wikimediaDiagram("Reaction1.png"),
  "/note-images/chemistry/exothermic-reactions.png": wikimediaDiagram("Activation_energy.svg"),
  "/note-images/chemistry/endothermic-reactions.png": wikimediaDiagram("Activation_energy.svg"),
  "/note-images/chemistry/energy-changes.png": wikimediaDiagram("Activation_energy.svg"),
  "/note-images/chemistry/reactivity-series.png": wikimediaDiagram("Reactivity_metals_in_dilute_sulfuric_acid.png"),
  "/note-images/chemistry/metal-extraction.png": wikimediaDiagram("Reactivity_metals_in_dilute_sulfuric_acid.png"),
  "/note-images/chemistry/modern-materials.png": wikimediaDiagram("Reactivity_metals_in_dilute_sulfuric_acid.png"),
  "/note-images/chemistry/earth-structure.png": wikimediaDiagram("Atmosphere_layers-en.svg"),
  "/note-images/chemistry/atmosphere.png": wikimediaDiagram("Atmosphere_layers-en.svg"),
  "/note-images/chemistry/climate-change.png": wikimediaDiagram("Atmosphere_layers-en.svg"),
  "/note-images/physics/describing-motion.png": wikimediaDiagram("Free_body.svg"),
  "/note-images/physics/forces.png": wikimediaDiagram("Free_body.svg"),
  "/note-images/physics/moments-and-pressure.png": wikimediaDiagram("Free_body.svg"),
  "/note-images/physics/energy-stores-and-transfers.png": wikimediaDiagram("Fluorescent_Energy.svg"),
  "/note-images/physics/work-and-power.png": wikimediaDiagram("Fluorescent_Energy.svg"),
  "/note-images/physics/heating-and-energy-use.png": wikimediaDiagram("Fluorescent_Energy.svg"),
  "/note-images/physics/wave-properties.png": wikimediaDiagram("Wave_characteristics.svg"),
  "/note-images/physics/sound.png": wikimediaDiagram("Wave_characteristics.svg"),
  "/note-images/physics/light-and-colour.png": wikimediaDiagram("Wave_characteristics.svg"),
  "/note-images/physics/static-electricity.png": wikimediaDiagram("Circuit_diagram.svg"),
  "/note-images/physics/circuits.png": wikimediaDiagram("Circuit_diagram.svg"),
  "/note-images/physics/electromagnets.png": wikimediaDiagram("Circuit_diagram.svg"),
  "/note-images/physics/earth-sun-and-moon.png": wikimediaDiagram("Solar_System_true_color.jpg"),
  "/note-images/physics/seasons.png": wikimediaDiagram("Solar_System_true_color.jpg"),
  "/note-images/physics/solar-system-and-beyond.png": wikimediaDiagram("Solar_System_true_color.jpg"),
};

const resolveImageSource = (source) => {
  const decodedSource = decodeURIComponent(source);
  return localMathImages[source] || localMathImages[decodedSource] || onlinePlaceholderImages[source] || source;
};

const isSubchapterPlaceholder = (source) => source.startsWith("/note-images/");
const commonsSearchUrl = (query) => `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`;
const searchTermForImage = (alt) => `${alt.replace(/^illustration of\s+/i, "").replace(/^a\s+/i, "")} diagram`;

function InternetDiagram({ source, fallback, alt }) {
  const [image, setImage] = useState({ src: fallback, sourceUrl: null });
  const shouldSearch = isSubchapterPlaceholder(source);

  useEffect(() => {
    if (!shouldSearch) return undefined;

    const controller = new AbortController();
    fetch(commonsSearchUrl(searchTermForImage(alt)), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const page = Object.values(data?.query?.pages || {})[0];
        const imageInfo = page?.imageinfo?.[0];
        if (imageInfo?.thumburl) setImage({ src: imageInfo.thumburl, sourceUrl: imageInfo.descriptionurl || null });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [alt, fallback, shouldSearch]);

  const imageElement = <img src={image.src} alt={alt} loading="lazy" decoding="async" onError={() => setImage({ src: fallback, sourceUrl: null })} />;
  return image.sourceUrl ? <a href={image.sourceUrl} target="_blank" rel="noreferrer" title="View image source and licence details">{imageElement}</a> : imageElement;
}

function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  const showPrevious = () => setActiveIndex(current => (current - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex(current => (current + 1) % images.length);

  return <figure className="markdown-figure markdown-image-gallery">
    <div className="markdown-image-gallery-stage">
      <InternetDiagram key={activeImage.source} source={activeImage.source} fallback={activeImage.fallback} alt={activeImage.alt} />
      <button type="button" className="previous" onClick={showPrevious} aria-label="Show previous diagram"><FiChevronLeft aria-hidden="true" /></button>
      <button type="button" className="next" onClick={showNext} aria-label="Show next diagram"><FiChevronRight aria-hidden="true" /></button>
    </div>
    <figcaption><span>{activeImage.caption || activeImage.alt}</span><span>{activeIndex + 1} of {images.length}</span></figcaption>
  </figure>;
}

export default function MarkdownRenderer({ source, glossary = "science" }) {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const blocks = [];
  const seenTerms = new Set();
  const glossaryEntries = Object.entries(glossaries[glossary] || {}).sort(([a], [b]) => b.length - a.length);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.trim().startsWith("$$")) {
      const math = [];
      const first = line.trim().slice(2);
      if (first.endsWith("$$")) {
        math.push(first.slice(0, -2));
        index += 1;
      } else {
        if (first) math.push(first);
        index += 1;
        while (index < lines.length && !lines[index].trim().endsWith("$$")) { math.push(lines[index]); index += 1; }
        if (index < lines.length) { math.push(lines[index].trim().slice(0, -2)); index += 1; }
      }
      blocks.push(<MathExpression display value={math.join("\n").trim()} key={`math-${index}`} />);
      continue;
    }

    const image = line.trim().match(blockImagePattern);
    if (image) {
      const galleryImages = [];
      const galleryStart = index;
      while (index < lines.length) {
        const galleryImage = lines[index].trim().match(blockImagePattern);
        if (!galleryImage) break;
        const imageSource = resolveImageSource(galleryImage[2]);
        if (safeImageSource(imageSource)) galleryImages.push({ alt: galleryImage[1], source: galleryImage[2], fallback: imageSource, caption: galleryImage[3] });
        index += 1;
      }
      if (galleryImages.length > 1) blocks.push(<ImageGallery images={galleryImages} key={`gallery-${galleryStart}`} />);
      else if (galleryImages.length === 1) {
        const singleImage = galleryImages[0];
        blocks.push(<figure className="markdown-figure" key={`image-${galleryStart}`}><InternetDiagram key={`${singleImage.source}-${singleImage.alt}`} source={singleImage.source} fallback={singleImage.fallback} alt={singleImage.alt} />{singleImage.caption && <figcaption>{singleImage.caption}</figcaption>}</figure>);
      }
      continue;
    }

    const pendingImage = line.trim().match(/^!\[([^\]]+)\]$/);
    if (pendingImage) {
      blocks.push(<p className="markdown-image-pending" key={`pending-image-${index}`}>{line.trim()}</p>);
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) { code.push(lines[index]); index += 1; }
      blocks.push(<pre key={`code-${index}`} data-language={language}><code>{code.join("\n")}</code></pre>);
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Level = `h${heading[1].length}`;
      blocks.push(<Level id={headingId(heading[2])} key={`heading-${index}`}>{renderInline(heading[2], `heading-${index}`, seenTerms, glossaryEntries, false)}</Level>);
      index += 1;
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isDividerRow(lines[index + 1])) {
      const headers = tableCells(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) { rows.push(tableCells(lines[index])); index += 1; }
      blocks.push(<div className="markdown-table-wrap" key={`table-${index}`}><table><thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex}>{renderInline(cell, `th-${index}-${cellIndex}`, seenTerms, glossaryEntries)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell, `td-${rowIndex}-${cellIndex}`, seenTerms, glossaryEntries)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) { items.push(lines[index].replace(/^\s*[-*]\s+/, "")); index += 1; }
      const isChecklist = items.every((item) => /^\[[ xX]\]\s+/.test(item));
      blocks.push(<ul className={isChecklist ? "markdown-checklist" : undefined} key={`list-${index}`}>{items.map((item, itemIndex) => {
        const checkbox = item.match(/^\[([ xX])\]\s+(.+)$/);
        return <li key={itemIndex}>{checkbox && <input type="checkbox" checked={checkbox[1].toLowerCase() === "x"} readOnly aria-label="Revision checklist item" />}{renderInline(checkbox ? checkbox[2] : item, `li-${index}-${itemIndex}`, seenTerms, glossaryEntries)}</li>;
      })}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) { items.push(lines[index].replace(/^\d+\.\s+/, "")); index += 1; }
      blocks.push(<ol key={`ordered-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `oli-${index}-${itemIndex}`, seenTerms, glossaryEntries)}</li>)}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith("> ")) { quote.push(lines[index].slice(2)); index += 1; }
      const info = quote[0].match(/^\[!INFO\]\s*(?:\*\*)?(.+?)(?:\*\*)?$/i);
      if (info) {
        const body = quote.slice(1).join(" ").trim();
        blocks.push(<aside className="markdown-callout markdown-callout-info" key={`callout-${index}`}><span className="markdown-callout-icon" aria-hidden="true">!</span><div><h3>{renderInline(info[1], `callout-title-${index}`, seenTerms, glossaryEntries, false)}</h3>{body && <p>{renderInline(body, `callout-body-${index}`, seenTerms, glossaryEntries)}</p>}</div></aside>);
      } else blocks.push(<blockquote key={`quote-${index}`}>{renderInline(quote.join(" "), `quote-${index}`, seenTerms, glossaryEntries)}</blockquote>);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,6})\s+|^\s*[-*]\s+|^\d+\.\s+|^>\s+|^```|^---+$|^\$\$|^!\[[^\]]*\]\(/.test(lines[index]) && !(lines[index].includes("|") && index + 1 < lines.length && isDividerRow(lines[index + 1]))) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{paragraph.flatMap((paragraphLine, lineIndex) => [lineIndex > 0 && <br key={`break-${lineIndex}`} />, ...renderInline(paragraphLine, `p-${index}-${lineIndex}`, seenTerms, glossaryEntries)])}</p>);
  }

  return <div className="markdown-content">{blocks}</div>;
}
