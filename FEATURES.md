# StudyForge feature and route inventory

Baseline: `baseline/pre-core-focus-2026-10-04` at commit `f36db97` preserves the application before the core-loop reduction. The active work continues on `refocus/ks3-maths-core`.

No component, curriculum file, Firebase collection, or teacher workflow was deleted during this reduction. "Later" and "Experimental" mean removed from the primary learner journey, not removed from the repository.

## Classification

- **Core now**: part of the active learner or account path and held to the current lint, test, build, and failure-message boundary.
- **Later**: preserved and routable, but not promoted in the primary navigation.
- **Experimental**: preserved prototype or staff tooling that needs a separate production review.
- **Broken or unverified**: preserved but not claimed as production-ready or independently content-verified.

## Route inventory

| Route | Access | Classification | Current purpose |
| --- | --- | --- | --- |
| `/` | Public | Core now | Landing page and guest entry point. |
| `/courses` | Public student surface | Core now | Focused Maths and science subject catalogue. |
| `/science/:subject` | Public student surface | Core now | Science topic index. |
| `/science/:subject/:topic` | Public student surface | Core now | Topic hub linking lesson, recall, practice, and test. |
| `/learn/:subject/:topic` | Public student surface | Core now | Guided lesson and five-question guest check. Signed-in users can persist progress. |
| `/examquestions` | Public student surface | Core now | Practice library and test builder. Guest history is not persisted. |
| `/practice/:subject/:topic` | Public for independent practice; account required for assignments | Core now | Immediate feedback, test mode, assignment mode, and account-save prompt. |
| `/notes` | Public | Core now | Maths-first revision-note landing and search. |
| `/notes/maths` | Public | Core now | Complete KS3 Maths index for Years 7 to 9. |
| `/notes/maths/:year/group/:group` | Public | Core now | Grouped Maths reader compatibility route. |
| `/notes/maths/:year/group/:group/:note` | Public | Core now | Grouped Maths revision-note reader. |
| `/notes/maths/:year/:lesson` | Public | Core now | Legacy Maths lesson redirect/reader route. |
| `/notes/:id` | Public | Later | Preserved non-Maths subject note index. |
| `/notes/:subject/:topic` | Public | Later | Preserved Markdown note redirect route. |
| `/notes/:subject/:topic/:section` | Public | Later | Preserved Markdown subchapter reader. |
| `/flashcards` | Public student surface | Core now | Maths-first flashcard landing. |
| `/flashcards/:subject` | Public student surface | Core now for Maths; Later for hidden science decks | Chapter list. |
| `/flashcards/:subject/:chapter` | Public student surface | Core now for Maths; Later for hidden science decks | Flashcard review session. |
| `/flashcards/custom` | Public student surface | Experimental | CSV upload deck, retained but removed from the main landing page. |
| `/launchpad` | Signed-in account | Core now | Role-aware student or teacher dashboard. Hidden from guests. |
| `/my-notes` | Signed-in student | Core now | Private student notebook. Hidden from guests. |
| `/settings` | Signed-in account | Core now | Password and account settings. |
| `/teachers` | Teacher account | Experimental | Teacher dashboard, classes, and homework management. |
| `/teachers/notes` | Teacher account | Experimental | Teacher note authoring tools. |
| `/teachers/flashcards` | Teacher account | Experimental | Teacher flashcard content tools. |
| `/teachers/questions` | Teacher account | Experimental | Teacher question-bank tools. |
| `/teachers/accounts` | Teacher account | Experimental | Account directory. |
| `/teachers/assignments/:assignmentId` | Teacher account | Experimental | Assignment analytics. |
| `/teacher-tools` | Public marketing surface; teacher actions remain gated | Later | Teacher-tool showcase. |
| `/join` | Public | Later | Contributor and ambassador interest page. |
| `/ambassadors` | Public redirect | Later | Redirects to `/join`. |
| `/about` | Public | Core now | Product explanation and revision-loop overview. |
| `/mockexams` | Public student surface | Broken or unverified | Prototype mock-exam experience, retained outside the active navigation. |
| `/pastpapers` | Public student surface | Broken or unverified | External past-paper library, retained by route but its button is removed. |

## Feature inventory

### Core now

- Guest landing, subject discovery, topic opening, lesson reading, short practice, instant feedback, and test completion.
- Full KS3 Maths notes, imagery, topic hierarchy, and Maths flashcards. No Maths content was reduced.
- Signed-in progress history, private notes, account settings, and role dashboard.
- Breadcrumbs for guests and signed-in students.
- Anonymous funnel instrumentation for landing visits, topic starts, lesson completion, practice starts/completion, account creation, return visits, and flow abandonment.
- Friendly visible states for failed authentication, question loading, homework submission, progress saving, and cloud sync.

### Later

- Non-Maths note libraries and science flashcard decks remain directly routable but are not promoted on the two library landing pages.
- Join/ambassador content and teacher-tool marketing.
- The past-paper component, data, and route remain intact, with no primary button.

### Experimental

- Teacher class, assignment, analytics, content editing, study pack, and account-directory workflows.
- Custom CSV flashcard upload.
- Optional Cloud Functions grading/course-attempt implementation in `functions/`, which is not part of the default Spark deployment.

### Broken or unverified

- Mock exams and past-paper source completeness have not been independently content-verified in this core pass.
- Direct non-Maths routes are preserved, but their full content coverage and cross-link quality were not re-audited.
- Teacher workflows are preserved but are outside the active-path production confidence claim for this pass.
