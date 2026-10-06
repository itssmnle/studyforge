# StudyForge content guide

## Flashcards

Edit or add CSV files in `content/flashcards/`.

Each file needs this header:

```csv
Question,Answer
```

If an answer contains a comma, wrap the whole answer in double quotes. To add a new deck, add its filename, title, subject, and card count to `src/data/flashcardDecks.json`. The filename must match exactly. The app bundles these CSVs automatically during the build, so no React component normally needs editing.

## Practice questions

Edit the matching CSV in `content/question-bank/<subject>/`. These files use the exact 17-column header enforced by `scripts/questionBank.mjs`. Keep IDs unique and keep `subtopic` values aligned with `src/data/scienceCurriculum.js`.

After changing practice questions, run `npm run questions:build`. This regenerates `src/data/scienceQuestions.generated.json`; do not edit that generated file by hand.

## Revision notes

Add or edit Markdown in `content/notes/` or the relevant folder under `content/science-lessons/`. Keep the existing front matter and topic IDs so the note remains discoverable. Image placeholders can stay highlighted yellow until real images are linked.

## Search

The global search index is built from the local notes, flashcards, and maths content by `src/utils/searchLibrary.js`. Source edits appear after the next production build. Teacher-created Firestore content is a separate source.

## Safe update and deploy

From the project folder:

```bash
cd /Users/samle/Documents/Codex/web/studyforge/studyforge
npm run questions:build
npm run lint
npm run build
npx firebase-tools deploy --only hosting:studyforge --project revision-hub-ee911
```

Use the deploy command on one line. A trailing `\\` means “continue this shell command”, so it can leave the terminal waiting instead of deploying if there is no next line.

## Git history

Check changes with `git status --short`. Stage only the content files you meant to change, then commit:

```bash
git add content/flashcards src/data/flashcardDecks.json
git commit -m "update science flashcards"
```

The commit is the permanent downloadable history. Firebase preview channels are temporary snapshots and expire.
