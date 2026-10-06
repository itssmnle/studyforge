# Firebase data and trust boundary

StudyForge uses Firebase Authentication, Firestore, and Hosting in project `revision-hub-ee911`. The default deployment script publishes Hosting and Firestore Rules only. The `functions/` directory is retained for optional future server-authoritative workflows and is not deployed by `npm run deploy:spark`.

## Collections

| Collection or path | Purpose | Client access assumption |
| --- | --- | --- |
| `users/{uid}` | Account profile and role | Owner can read/update constrained fields. Teachers can read profiles. New browser registrations can create student profiles only. |
| `blockedAccounts/{uid}` | Incident/account block marker | Consulted by rules. No client writes are allowed by the current rules. |
| `accountSecurity/{uid}` | Session revocation cutoff | Consulted by rules. No client writes are allowed by the current rules. |
| `classes/{classId}` | Teacher-owned classes and membership | Members can read. Only the owning teacher can create/change/delete. |
| `assignments/{assignmentId}` | Teacher-created homework and immutable question snapshots | Class members can read. Creating and changing is restricted to authorised teachers. |
| `submissions/{assignmentId}__{studentUid}` | One homework submission per student and assignment | Student creates once with exact fields. Student and owning teacher can read. Updates/deletes are denied. |
| `practice/{studentUid}__{practiceId}` | Private independent-practice history | Authenticated owner only. The browser also keeps an account-scoped local cache. |
| `users/{uid}/notes/{noteId}` | Private student notes | Authenticated student owner only, with field and size validation. |
| `users/{uid}/mastery/{subject}__{topic}` | Notes-read status | Authenticated owner only. Rules accept notes-read state, not browser-supplied grades. |
| `users/{uid}/flashcards/{deckId}` | Personal flashcard progress/overrides | Authenticated owner only. |
| `flashcardDecks/{deckId}` | Published deck overrides | Public read, teacher write. |
| `questions/{questionId}` | Published question bank | Signed-in read, teacher write. The public guest path uses the bundled validated fallback. |
| `teacherNotes/{noteId}` | Published teacher-authored notes | Public read, constrained teacher write. |
| `studyPacks/{packId}` | Teacher-owned study packs | Owning teacher only. |
| `analyticsEvents/{eventId}` | Anonymous product funnel events | Create-only for anyone, strict event/field allowlist, no client reads, updates, or deletes. |
| `courseAttempts/{attemptId}` | Optional server-side quiz attempts | Used only by the undeployed Cloud Functions prototype. |

## Analytics privacy and reliability

Analytics events contain a random browser visitor ID, random tab session ID, route, timestamp, event name, and a small allowlisted metadata map. They do not contain usernames, Firebase UIDs, answers, note text, or assignment content. Failed writes queue locally and retry when the browser returns online.

The unauthenticated create-only analytics collection is intentionally narrow, but Firestore Rules cannot rate-limit abusive clients. Before materially increasing traffic, enable Firebase App Check or place telemetry behind a rate-limited endpoint. No analytics dashboard or client read permission is included.

## Authentication limitations

- Usernames are converted to synthetic internal addresses such as `username@users.studyforge.local` for Firebase email/password authentication.
- Those addresses cannot receive password-reset email. Recovery requires the administrator reset workflow documented in `README.md`.
- Self-registration creates student accounts only. Teacher roles must be provisioned and controlled separately.
- Teacher MFA and App Check are not enabled.
- Some imported accounts may still use known or shared default passwords. Rules and session revocation do not mitigate a password known to another person.
- The browser stores a minimal display session in local storage. Firebase Auth remains the source of authentication truth, and Firestore Rules enforce data access.
- Independent practice grading is self-study feedback, not an exam-security or server-authoritative grading system. Homework stores answers and is recalculated against the teacher snapshot.

## Active production confidence boundary

The current confidence claim covers public discovery, lesson reading, guest practice and feedback, account creation/login, signed-in independent-practice persistence, and rule-constrained access to those records. Teacher authoring/analytics, mock exams, past papers, and optional Cloud Functions remain outside this pass and must be reviewed separately before their status is promoted.
