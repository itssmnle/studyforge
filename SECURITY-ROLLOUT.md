# Spark security implementation, 11 September 2026

## Current design

StudyForge stays on Firebase Spark. Hosting and Firestore Rules are the production deployment targets. No Cloud Functions or billing upgrade is required for the current application. The optional backend source remains in functions/ for future work, but is excluded from the default deployment configuration.

## Regression fixes, 11 September 2026

- The password visibility control now sits inside the password field with reserved space and an accessible pressed state.
- Login performs one profile read, publishes the signed-in state immediately, and refreshes dashboard data in parallel. The full question bank no longer blocks login.
- Firebase authentication explicitly uses browser-local persistence. The application stores a minimal session profile for rendering and never stores the password.
- Homework submission uses cached trusted assignment and session data where available, then performs one Firestore transaction. It no longer rereads the profile and saved submission after every save.
- Written-answer self-marking is restored. Student claims are stored separately from automatic correctness, and teacher analytics show both values.
- Assignment owners can delete homework after confirming. Submission records are retained for audit even when the assignment is removed.

Homework submissions contain only answers, assignment/class/teacher/student identifiers, schemaVersion 2 and a server-generated submission timestamp. Firestore Rules validate exact top-level fields, canonical identity, class membership and assigned-recipient membership. Students cannot submit scores, self-marks or answer keys, and cannot update or delete a saved submission. One submission per student per assignment is enforced by its document ID. Retries return the existing submission.

When loading homework, the application calculates marks from saved answers and the teacher's canonical questionSnapshot. Student-supplied marks and answer keys, including those in historical submissions, are ignored. Malformed answer values are treated as blank. Missing question sets appear as pending and are excluded from score averages. Teachers must open and save legacy assignments without question snapshots before new submissions can be made.

This is rules-protected answer storage with browser-calculated reporting. It is not server-authoritative grading. Editing a student's browser cannot change the teacher's saved answers or reported score, but answer keys remain readable in the question bank and assignments. Teacher edits to a question set can change recalculated marks. This is not an exam anti-cheating system.

Course quizzes are private self-study. Notes-read state syncs to Firestore using a strict notes-only schema. Practice percentages and unit unlocks are saved only on the current device, clearly labelled as unverified self-study. Browser-supplied mastery grades remain blocked in Firestore. Historic unverified cloud percentages do not unlock units.

## Account restoration

Completed: all 101 accounts were re-enabled and verified, with zero password changes. The Spark rules and updated hosting build were deployed successfully.

The user explicitly requested keeping existing passwords when re-enabling the 101 accounts previously disabled, including 12 teachers. Restoration changes only enablement and session state. No passwords are changed and no credentials are sent to anyone.

Restoration revokes refresh tokens, writes server-controlled accountSecurity.validAfter, re-enables each account, verifies enablement and removes the incident block. Rules require a fresh login after that cutoff, so old ID tokens remain rejected after unblocking.

The known shared-default-password risk remains. Anyone who knows a username and its default password can sign in, including to affected teacher accounts. Session controls and Firestore Rules do not resolve a known password. Teacher MFA and App Check are not enabled.

## Deployment and checks

```sh
npm run test:security
npm run deploy:spark
```

Validation includes production build, targeted lint, grading tests that reject forged marks, and live tests using a temporary account. Live tests cover a valid first-submission transaction, score/identity/timestamp forgery, immutable submitted answers, notes-only mastery, and old-session rejection. Temporary accounts and documents are removed afterward.

functions/reenable-accounts.mjs defaults to dry run and operates only on incident blocks with reason unchanged-import-password. --apply restores those accounts without changing passwords.

The optional, undeployed backend dependency tree has two moderate transitive gaxios/uuid audit findings. It is not used by the Spark frontend or deployed as Cloud Functions.
