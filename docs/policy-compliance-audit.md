# Form 1 policy-compliance and implementation audit

Audit scope: the isolated project at `/home/ubuntu/esutverify`. No integration, production database, authentication, production storage, or marketplace-role changes were performed. The audit inspected implementation behavior, tests, documentation, and the restarted development server.

## Executive result

The core four-path form and client-side evidence rules pass for the standalone prototype. The correction workflow preserves attempt events, records evidence-category and declaration metadata, and enforces the one-correction limit in the mock adapter. The supplied document now provides exact **proposed** declaration wording for prototype use; the application labels it pending final policy review and records version/status metadata. The project is **not ready for production integration** because final policy/legal approval, privacy notice, lawful basis, current-session evidence verification, and the real backend/private-upload/audit-history implementation remain unresolved.

## Requirement checklist

| Requirement | Result | Evidence and finding |
|---|---|---|
| Four distinct applicant paths | PASS | `src/App.tsx:169-170` selects Student versus Business/Vendor; `src/App.tsx:174` renders the three business types; `src/validation.ts:54-89` branches validation by type. |
| Student applicant fields | PASS | `src/App.tsx:176-177` renders student identity, matriculation number, faculty, department, level, and optional years. |
| Current-session course registration evidence plus either ID or JAMB | PASS for client rule; NEEDS REVIEW for factual session verification | `src/validation.ts:37-49` requires the course-registration file and one of the two supporting files. The UI explains current-session intent at `src/App.tsx:184`, but no code can verify that a document belongs to the current academic session. The backend must perform that review. |
| Registered owner registration, ownership, and ESUT connection evidence | PASS | `src/validation.ts:62-70` requires all three categories; `src/App.tsx:178` exposes the corresponding fields and uploads. |
| Unregistered vendor identity, selling activity, and ESUT connection; no CAC requirement | PASS | `src/validation.ts:72-79` requires the three categories without CAC; `src/App.tsx:179` renders the vendor path and explicitly says CAC is not required. |
| Authorized representative registration, applicant identity, ESUT connection, and authorization | PASS for required client fields; NEEDS REVIEW for manual evidence assessment | Full legal name is shared at `src/validation.ts:60-61`; business, role, and connection fields are at `src/validation.ts:81-88` and `src/App.tsx:180`. The three authorization options and OR wording for stamp/signature are shown at `src/App.tsx:187`. The client cannot determine whether a document actually proves authority. |
| Unclear evidence can lead to correction instead of automatic fraud treatment | PASS in mock workflow | `src/services/mockSubmission.ts:53-59` returns a correction request and explicitly records a note that it is not a fraud finding. |
| Exact finalized declaration wording | PASS for proposed prototype wording; NEEDS REVIEW for production use | `src/declarations.ts` contains the four exact proposed strings supplied by the user’s document and the UI labels them `Proposed wording — pending final policy review`. They must not be described as legally approved or finalized. |
| Declaration acceptance, version, and timestamp | PASS for prototype metadata; NEEDS REVIEW for policy approval | `src/types.ts` and `src/services/mockSubmission.ts` preserve the proposed wording version, wording status, applicable declaration keys, per-acknowledgement timestamps, and submission timestamp. The version is `esut-seller-declarations-proposed-v1`; status is `proposed-wording-pending-final-policy-review`. |
| One correction opportunity for every path | PASS in UI and mock adapter | `src/App.tsx:123-133` records correction events and changes the correction count; `src/services/mockSubmission.ts:44-59` closes a repeat request after one correction has been used. |
| Corrected submission that fails review closes with a specific reason | PASS for mock control; backend required | `src/App.tsx:195` exposes simulated closure after corrected review; `src/services/mockSubmission.ts:61-62` preserves the supplied closure reason. Production must make the reviewer/backend authoritative. |
| Original attempts, corrections, evidence categories, decisions, and reviewer notes remain in history | PASS for prototype event history; NEEDS REVIEW for production audit depth | `src/App.tsx:117-118` appends submissions; `src/App.tsx:125-127` appends correction events; `src/types.ts:27-40` records event, evidence categories, declaration metadata, reasons, and reviewer note. There is no real reviewer decision store or private upload reference because this is intentionally standalone. |
| Evidence is in memory and not browser-persisted | PASS by inspection and test | `src/App.tsx:54` stores metadata in React state; `src/components/EvidenceUpload.tsx:24-40` reads only file metadata; `src/App.test.tsx:48-56` verifies duplicate submission and empty localStorage. |
| No public evidence URLs or ordinary response exposure | PASS for standalone; backend required | The prototype never uploads or returns evidence content. The future contract requires private upload references at `docs/integration-contract.md:25` and server-side access control. |
| File type and 5 MB validation | PASS for client-side validation | `src/validation.ts:12-18` checks allowed MIME values and size; `src/components/EvidenceUpload.tsx:24-39` provides the file input and guidance. Server-side content validation remains required. |
| Duplicate submission prevention | PASS | `src/App.tsx:96-99` ignores submit while submitting and `src/App.tsx:192` disables the button; `src/App.test.tsx:48-56` covers double-click behavior. |
| Accessible field errors and summary | PASS | `src/App.tsx:23-40` associates field errors with controls; `src/App.tsx:164` renders an alert summary; `src/App.test.tsx:40-46` covers incomplete submission. |
| Mock approval cannot grant permissions or activate a store | PASS | The mock adapter returns awaiting review only at `src/services/mockSubmission.ts:24-41` and explicitly states no seller permissions; the scope excludes Store application in `README.md:3`. |
| Compatibility with React/TypeScript/Vite/Wouter/tRPC/Express/MySQL/Drizzle | NEEDS REVIEW before integration | The contract maps the standalone UI to a future React/Vite frontend and Express/tRPC/MySQL/Drizzle backend at `docs/integration-contract.md:3`, but no actual marketplace stack is present in this isolated project. Wouter mounting and schema design require repository inspection and owner approval. |
| Client/backend enforcement boundary | PASS as documentation; backend implementation pending | `docs/integration-contract.md:43-49` separates usability validation from authoritative server checks, including account binding, private storage, declaration version, idempotency, correction limits, status transitions, and audit history. |

## Confirmed defects and smallest safe fixes applied

1. **Attempt metadata was previously incomplete.** The mock history did not record evidence categories, declaration version/timestamp, correction events, or reviewer notes. The safe fix adds these fields to `src/types.ts:25-40`, populates them in `src/App.tsx:109-118`, and preserves correction events at `src/App.tsx:123-127`.
2. **The mock adapter relied on the UI to enforce the one-correction rule.** The safe fix makes `src/services/mockSubmission.ts:44-59` close repeat correction requests independently of UI behavior.
3. **Correction requests could be misread as fraud findings.** The safe fix adds the explicit mock reviewer note at `src/services/mockSubmission.ts:57-58` and documents the rule in `docs/integration-contract.md:41`.
4. **The integration contract did not clearly separate frontend checks from backend authority.** The safe fix adds the explicit boundary and stack-compatibility notes in `docs/integration-contract.md:3-7` and `docs/integration-contract.md:43-49`.
5. **The supplied wording is proposed, not final policy.** `src/declarations.ts` preserves the exact four strings supplied for prototype use, labels them pending final policy review, records named conditional acknowledgements, and keeps the privacy URL empty until an approved URL is supplied.

## Test coverage and remaining critical gaps

The final suite has 17 tests across four files:

- `src/App.test.tsx`: five tests for conditional path rendering, stale-field reset, accessible incomplete submission, duplicate submission/localStorage behavior, and preserved correction-history/closure behavior.
- `src/validation.test.ts`: six tests for student evidence, file type/size limits, registered-owner evidence, unregistered-vendor no-CAC behavior, representative authorization, and declarations.
- `src/services/mockSubmission.test.ts`: two tests for explicit mock status, metadata preservation, correction notes, closure, and repeat-correction enforcement.
- `src/declarations.test.ts`: three tests for exact proposed wording, applicant-type conditional declaration selection, and the intentionally empty Privacy Policy URL.

Remaining critical gaps are intentional standalone limitations or policy dependencies: final declaration approval/effective date, privacy notice and URL, lawful basis and consent decision, controller identity, retention, reviewer access, current-session document verification, actual private upload authorization, authenticated account binding, server-side MIME/content validation, real reviewer decisions and notes, production persistence, and the final Wouter/tRPC/Express/MySQL/Drizzle integration shape. No test can prove those without approved policy/legal decisions or the existing marketplace backend.

## Verification results

- `npm test`: **17 tests passed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**.
- Development server restarted with the current environment and responded `HTTP 200` on `/`.
- `/manus-routes.json` responded successfully with the root route manifest.

## Repository state

The audit began from commit `57be83df40dca494e04a8095b2abc156e5b96648` on branch `main`, tracking `origin/main`. The audit fixes and this report are saved in the final audit checkpoint described in the handoff. Integration remains explicitly blocked pending policy review.
