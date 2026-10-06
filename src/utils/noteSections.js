export const noteSectionId = (title) => title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const withoutTrailingDivider = (source) => source
  .trim()
  .replace(/\n+---\s*$/, "")
  .trim();

export const splitNoteIntoSections = (body) => {
  const lines = body.replaceAll("\r\n", "\n").split("\n");
  const starts = [];

  lines.forEach((line, index) => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) starts.push({ index, title: heading[1].trim() });
  });

  const firstSectionIndex = starts[0]?.index ?? lines.length;
  const intro = lines.slice(0, firstSectionIndex).filter((line) => !/^#\s+/.test(line)).join("\n").trim();
  const usedIds = new Map();

  const sections = starts.map((start, index) => {
    const baseId = noteSectionId(start.title) || `section-${index + 1}`;
    const count = (usedIds.get(baseId) || 0) + 1;
    usedIds.set(baseId, count);
    const id = count === 1 ? baseId : `${baseId}-${count}`;
    const end = starts[index + 1]?.index ?? lines.length;
    return { id, title: start.title, source: withoutTrailingDivider(lines.slice(start.index, end).join("\n")) };
  });

  return { intro, sections };
};

