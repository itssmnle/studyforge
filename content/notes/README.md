# Adding StudyForge revision notes

Create one Markdown file per curriculum topic:

```text
src/content/notes/<subject>/<topic>.md
```

The folder and filename must match the IDs in `src/data/scienceCurriculum.js`.

Start each file with:

```yaml
---
title: Display title
summary: One-sentence description shown in the notes library.
qualification: KS4
author: Your full name
updated: 2026-09-09
---
```

Each `##` heading becomes its own subchapter page. Supported content includes headings, paragraphs, bold text, inline code, links, images, blockquotes, bullet lists, numbered lists, fenced code blocks, horizontal rules, Markdown tables, and KaTeX equations. Use `$x^2 + y^2$` for inline maths, `$$\frac{d}{t}$$` for a display equation, and `$$\ce{2H2 + O2 -> 2H2O}$$` for chemical notation.

The first occurrence of a hard term receives a keyboard-accessible question-mark definition. Science notes use `src/data/scienceGlossary.js`; maths notes use `src/data/mathsGlossary.js`. Add terms only when the note does not already explain them clearly.

Put compressed diagrams and photos under `public/note-images/<subject>/`. Use descriptive lowercase filenames, preferably WebP or SVG. Then place the image on its own line in the note:

```md
![Diagram of a plant cell](/note-images/biology/plant-cell.svg "Plant cell structure")
```

The square-bracket text describes the image to screen-reader users. The quoted caption is optional. Keep images below about 500 KB where practical.

Temporary internet images must use HTTPS and should be followed by a link to their source and licence details.
