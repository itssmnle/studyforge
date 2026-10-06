# StudyForge

A KS3 Maths and KS4 science revision platform built with React and Vite. Visitors can read lessons and complete short practice without an account; registration is required only for saved progress and private workflows.

## Run locally

```bash
npm install
npm run dev
```

## Add revision notes

Create one Markdown file for each curriculum topic:

```text
src/content/notes/<subject>/<topic>.md
```

The subject folder and topic filename must match the IDs in
`src/data/scienceCurriculum.js`. For example:

```text
src/content/notes/chemistry/bonding.md
```

Start the file with this frontmatter:

```yaml
---
title: Bonding and Structure
summary: Ionic, covalent, and metallic bonding.
qualification: KS4
author: Your full name
updated: 2026-09-09
---
```

Then write normal Markdown below it. Each `##` heading becomes a separate
subchapter page. Supported features include headings, paragraphs, bold text,
inline code, links, images, blockquotes, lists, fenced code blocks, horizontal
rules, tables, inline maths such as `$x^2 + y^2$`, and display maths such as
`$$\frac{distance}{time}$$`. Chemical equations can use KaTeX mhchem syntax,
for example `$$\ce{6CO2 + 6H2O -> C6H12O6 + 6O2}$$`.

See `src/content/notes/README.md` and the existing example notes.

## Reset a username account password

StudyForge usernames map to internal Firebase email addresses, so normal email
reset links are not deliverable. A Firebase project administrator can safely
issue a temporary password from a trusted computer after running `firebase
login`. First preview the matching account:

```bash
cd functions
npm run account:reset -- --username student_username
```

Then apply the reset. The command asks for the temporary password through a
hidden terminal prompt, so it is not written into shell history:

```bash
npm run account:reset -- --username student_username --apply
```

The command does not print the password. It re-enables the account and revokes
its existing refresh tokens. The student should log in with the temporary
password and immediately change it from Settings.

## Bulk-edit practice questions

The maintainable question bank lives in `content/question-bank`. There is one
CSV file for every curriculum topic, grouped by subject. The subject and topic
come from the file path, so they do not need to be repeated in every row.

Use the existing header exactly. List values such as acceptable answers and
specification tags use `|` as their separator. Multiple-choice answers must
exactly match one of `optionA` through `optionD`.

Validate the CSV files and regenerate the app fallback:

```bash
npm run questions:validate
```

`npm run dev` and `npm run build` also regenerate the fallback automatically.
The website question editor remains available for individual additions and
small corrections. Those changes sync directly to Firestore and do not rewrite
the CSV files.

After running `firebase login`, publish CSV questions to the default project in
`.firebaserc`:

```bash
npm run questions:publish:dry-run
npm run questions:publish
npm run questions:verify-remote
```

That command creates or updates CSV-managed questions but does not delete any
documents. To also remove Firestore questions previously managed by the CSV
bank but since removed from the files, run:

```bash
npm run questions:publish:sync
```

The sync command never removes questions created through the website editor.

## Feature and data documentation

- `FEATURES.md` records every route and classifies active, later, experimental, and unverified features.
- `FIREBASE.md` documents collections, rules assumptions, analytics privacy, and prototype authentication limitations.
- `SECURITY-ROLLOUT.md` records the existing Spark security work and known account risks.

## Verification

```bash
npm run lint
npm run test:core
npm run build
```
