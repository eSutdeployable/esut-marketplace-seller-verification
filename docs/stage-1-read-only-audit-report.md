# ESUT Marketplace — Stage 1 Read-Only Policy Compliance and Implementation Audit

**Audit target:** `/home/ubuntu/esutverify`  
**Requested baseline:** `d721277e2db65275d4624c83089661723cf3c333`  
**Observed HEAD:** `d721277e2db65275d4624c83089661723cf3c333`  
**Branch:** `main`  
**Audit mode:** Read-only. No application code, policy wording, configuration, Git history, or production system was changed.

## 1. Executive summary

The standalone prototype implements the four requested seller-verification paths, client-side evidence requirements, conditional declarations, accessible step navigation, duplicate-click protection, a simulated one-correction workflow, and in-memory application history. Existing validation, typecheck, and production-build checks pass: 17 tests across four test files passed, TypeScript passed, and the Vite build passed.

The prototype is **not ready for production integration or real applicant evidence**. It has no real authentication, account binding, private upload service, authoritative backend, reviewer authorization, durable audit history, factual evidence verification, or production privacy/legal decisions. These boundaries are documented and appropriate for an isolated prototype.

Two implementation defects should be fixed before integration: detail-field errors share names with evidence keys and are routed to the wrong wizard step/control, and declaration timestamps are assigned at submission rather than when each acknowledgement is made. A third defect affects prototype history integrity: the correction-request history record retains `correctionCount: 0` while the separate UI state becomes 1.

## 2. Requirements verified in source code

### Applicant paths and evidence rules

The application exposes ESUT Student, Registered Business Owner, Unregistered Individual Vendor, and Authorized Representative of a Registered Business through `src/App.tsx:9-13,236-242`.

The student path collects full legal name, matriculation/registration number, faculty, department, and academic level. `src/validation.ts:29-50` requires a course-registration document and either an ESUT student ID or JAMB admission letter. The UI describes the course-registration requirement as current-session evidence in `src/App.tsx:250-251`. Actual session membership cannot be verified in this standalone client.

The registered-owner path collects business name, CAC number, business description, ownership claim, and ESUT connection. `src/validation.ts:53-65` requires CAC registration, ownership-claim, and community-connection evidence separately. A CAC certificate is therefore not treated as conclusive ownership proof.

The unregistered-vendor path requires identity evidence, genuine selling-activity evidence, and ESUT-community evidence without requiring CAC registration. This is implemented in `src/validation.ts:66-74` and rendered in `src/App.tsx:253`.

The representative path requires applicant identity, registered business details, CAC number, representative role, ESUT connection, business-registration evidence, community evidence, and authorization evidence. `src/App.tsx:254-255` provides Signed Business Authorization Letter, Appointment or Employment Letter, and Other Credible Authorization Document options. The copy correctly states that either a valid stamp or the granting authority’s signature is sufficient; both are not required.

The mock correction reason explicitly describes unclear documents as a correction opportunity rather than a fraud finding in `src/services/mockSubmission.ts:57-62`.

### Declaration behavior

`src/declarations.ts:17-38` contains the four proposed declaration strings. The common accuracy and verification declarations apply to every path. The ownership declaration applies only to registered business owners. The representative authorization declaration applies only to authorized representatives. This selection is centralized in `src/declarations.ts:40-45`.

The wording version is `esut-seller-declarations-proposed-v1` and the status is `proposed-wording-pending-final-policy-review` at `src/declarations.ts:11-12`. The UI does not describe the wording as final or legally approved. Hidden declaration state is reset when the applicant path or business type changes in `src/App.tsx:95-107,242`.

The mock submission record preserves declaration version, wording status, applicable declaration keys, per-record acknowledgement metadata, and submission timestamp through `src/types.ts:29-45` and `src/services/mockSubmission.ts:23-46`.

### Submission, correction, and history behavior

Initial submission returns simulated `awaiting_review` only. The mock response explicitly states that it does not approve the seller account or grant seller access (`src/services/mockSubmission.ts:23-46`).

The UI prevents duplicate clicks by ignoring submission while status is `submitting` and disabling the form controls (`src/App.tsx:146-181,231`). The behavior is covered in `src/App.test.tsx:60-69`.

The UI records initial submission, correction-request, corrected-submission, and closure events in React state (`src/App.tsx:178-201`). The mock adapter permits one correction and closes a repeated request (`src/services/mockSubmission.ts:48-67`). Correction reasons and reviewer notes are preserved in the in-memory record.

### Privacy and security boundary

`src/components/EvidenceUpload.tsx:31-35` copies only file name, size, MIME type, and last-modified metadata into React state. No file bytes are uploaded, no browser storage is used, and no public evidence URL is returned. The current test suite verifies empty localStorage after submission (`src/App.test.tsx:60-69`).

The client checks browser-reported MIME type and a 5 MB size limit in `src/validation.ts:13-18`. The file input uses filename/MIME accept hints in `src/components/EvidenceUpload.tsx:24-40`.

The privacy notice is separate from declarations in `src/App.tsx:258-266`. `PRIVACY_POLICY_URL` is intentionally empty in `src/declarations.ts:14-15`.

## 3. Requirements partially implemented or unverified

The current academic session is not identified or checked. The application can require a file to be present, but it cannot determine whether the document belongs to the current academic session.

Ownership claims, CAC records, identity documents, selling activity, ESUT connections, and representative authority are not semantically or factually reviewed by the client. The client checks metadata presence and MIME/size metadata only.

The displayed account email is a synthetic fixture, `test.account@esut.edu.ng`, from `src/types.ts:53`. There is no real account identity, authentication session, account binding, or reviewer authorization.

History exists only in active React state. The UI history list shows only record ID, status, and time at the end of `src/App.tsx`, while richer evidence and declaration metadata remain transient in memory. There is no durable immutable audit history.

`approved` is present in `VerificationStatus` and has display styling, but no current mock action creates an approved record. The reachable mock flow is awaiting review, correction requested, and closed.

The mock adapter accepts caller-supplied path, business type, evidence categories, declaration keys, and timestamps without independently validating them. That is acceptable for a mock boundary but cannot be used as production enforcement.

Compatibility with the existing marketplace route, Wouter, tRPC, Express, MySQL/Drizzle, authentication, seller permissions, and store-activation gate cannot be verified because those systems are not present in this isolated repository.

## 4. Confirmed defects

### P1 — Detail-field errors are routed to the evidence step

`src/App.tsx:22-33` defines `evidenceErrorKeys` using names that are also detail-field names: `ownershipClaim`, `sellingActivity`, and `communityConnection`. `validateCurrentStep` at `src/App.tsx:117-123` filters errors using those keys.

As a result, a missing registered-owner ownership explanation, vendor selling-activity description, or community-connection explanation is treated as an evidence-step error. The error may appear beside the upload control rather than beside the textarea that needs correction. The current tests only assert an aggregate error summary and do not detect this field/step mismatch.

**Recommended fix:** use structured validation errors with an explicit `step` and `target`, or give detail fields and evidence categories distinct keys. Add component tests for each affected detail field.

### P2 — Declaration acknowledgement timestamps are submission-time timestamps

`src/App.tsx:141-144` stores only boolean declaration state. At submission, `src/App.tsx:167-176` creates one `acceptedAt` value and assigns it to every applicable declaration. Therefore `acknowledgedDeclarations[].acknowledgedAt` represents submission time, not the time each checkbox was accepted.

This conflicts with the apparent per-acknowledgement metadata contract and weakens auditability.

**Recommended fix:** record a timestamp when each checkbox changes from unchecked to checked, preserve or clear it when the checkbox changes, and test that checkbox time differs from submission time when applicable.

### P2 — Correction count is inconsistent in preserved history

`src/services/mockSubmission.ts:48-63` returns a correction-request record by spreading the original record without incrementing `correctionCount`. `src/App.tsx:189` increments only separate UI state. Consequently, the correction-request event stored in history has `correctionCount: 0`, while the corrected submission later has 1.

The service test manually adds `correctionCount: 1` before closure at `src/services/mockSubmission.test.ts:42`, so the inconsistency is not caught by the current UI workflow tests.

**Recommended fix:** increment and persist `correctionCount` in the correction event returned by the mock/service boundary, then assert the exact count in the request, corrected-submission, repeat-request, and closure history tests.

### P3 — Mock test fixture permits an invalid declaration combination

`src/services/mockSubmission.test.ts:35` supplies an ownership declaration for an unregistered vendor, even though `getApplicableDeclarationKeys` excludes ownership for that path. The mock service does not validate the payload, so the test does not detect invalid declaration applicability.

**Recommended fix:** make the test fixture path-consistent and add negative contract tests rejecting conditional declarations that do not apply to the selected path.

### Documentation inconsistency

The supplied baseline is clean at `d721277e2db65275d4624c83089661723cf3c333`, but existing documentation contains stale checkpoint and policy references. For example, `docs/stage-1-completion-report.md:6` names checkpoint `95e75de64ec835c3f9b0429786825ee7ad69a107`, `docs/policy-compliance-audit.md:63` refers to an earlier audit starting point, and `docs/source-comparison.md:42` still refers to the old unconfirmed policy caveat. These are documentation inconsistencies, not application-code defects, and were not changed during this read-only audit.

## 5. Privacy and security findings

The standalone boundary is safe for synthetic demonstration data: no evidence bytes are uploaded, no browser storage is used, and no production endpoint or credential is referenced by the application source.

The client’s file checks are not security controls. Browser MIME values and filename accept hints are spoofable. Production requires server-side magic-byte/content validation, size enforcement, malware/scanning policy, private object storage, access control, and controlled retrieval.

There is no real authentication or account binding. A production backend must bind the application to the authenticated account and reject client-supplied account, role, status, or approval data.

The interface uses privacy-oriented copy such as “Your information is private,” but this is prototype copy rather than implemented confidentiality, encryption, authorization, or reviewer-access control.

The mock adapter stores only metadata in memory and returns no evidence content. The future integration contract correctly requires private upload references, server-side enforcement, idempotency, and durable audit history in `docs/integration-contract.md:25-45`.

## 6. Policy and legal blockers

The proposed declaration wording is not final policy. Final wording, effective date, approving owner, and production version must be confirmed.

The following remain unresolved in `docs/policy-questions.md`: data controller and contact, processing purposes, lawful basis, whether consent is required, Privacy Policy URL, retention/deletion, reviewer access, processors and recipients, applicant rights, complaint channel, applicable data-protection requirements, current-session definition, acceptable ESUT connection evidence, and authoritative status/correction rules.

The prototype must not be used for real applicant evidence or production KYC processing until these decisions are approved and implemented by the authoritative marketplace systems.

## 7. Integration contract gaps

`docs/integration-contract.md` clearly states that the existing marketplace must remain authoritative for authentication, account identity, roles, seller permissions, verification status, and store activation. It also correctly states that Stage 1 approval must not automatically activate a store or grant seller permissions.

However, the repository contains no actual integration implementation. The frontend currently sends mock metadata rather than private upload references, applicant fields, or an idempotency key. There is no upload phase, authenticated submission endpoint, reviewer flow, durable schema, private evidence-access policy, authoritative status transition service, or seller-permission gate.

The existing marketplace repository must be inspected before integration to determine the route, router, authentication source, tRPC procedures, Express boundary, MySQL/Drizzle schema ownership, permission model, and Stage 2 eligibility gate.

## 8. Test and build results

The following existing checks were run without changing tracked files:

- `npm test`: **PASS — 4 test files, 17 tests passed**.
- `npm run typecheck`: **PASS**.
- `npm run build`: **PASS — Vite production bundle generated**.
- Git diff/checks remained clean after the checks.

Existing tests cover path rendering/reset, aggregate incomplete validation, duplicate submission/no localStorage, evidence validation branches, proposed declaration strings/applicability, and mock correction/closure. They do not cover the three confirmed implementation defects, spoofed MIME/content, authentication/account binding, private evidence access, durable persistence, idempotency, or production integration.

## 9. Prioritized remediation plan

### P0 — Block real applicant data and integration

1. Do not connect this prototype to real applicant evidence or production KYC processing until final declaration/legal/privacy decisions are approved.
2. Implement authenticated backend account binding and reviewer authorization.
3. Implement private upload and access control with server-side byte/content/type/size validation and a documented scanning policy.
4. Implement durable immutable persistence for attempts, evidence references, declarations, correction events, decisions, reviewer notes, closure reasons, and audit history.
5. Implement server-authoritative status transitions, idempotency, and one-correction enforcement. Never trust client-supplied approval, role, account, or status values.

### P1 — Required before integration

1. Fix the detail/evidence error-key collision and add field-specific component tests.
2. Capture declaration acknowledgement timestamps at checkbox acceptance and add timestamp tests.
3. Make correction-count metadata consistent across all history events and add exact history assertions.
4. Confirm the existing marketplace’s route, authentication source, backend procedure, schema ownership, reviewer role, and seller-permission gate.

### P2 — Required before production launch

1. Add backend contract tests for all four applicant paths, declaration applicability, evidence completeness, account binding, idempotency, correction limits, unauthorized evidence access, and status rejection.
2. Add negative tests for spoofed MIME/content, oversized or ambiguous files, stale or foreign upload references, and invalid declaration payloads.
3. Define retention/deletion, privacy rights, complaint handling, processors/recipients, reviewer access, and operational audit controls.
4. Add an authoritative approval path only after reviewer/backend integration; keep seller permissions and store activation as separate gates.

### P3 — Improvements that can wait

1. Remove unreachable approved-state UI or connect it only to an authoritative decision response.
2. Correct stale checkpoint and policy wording in existing documentation.
3. Add durable observability, CSP/security headers, deployment controls, and retention/deletion jobs during integration planning.

## 10. Recommendation

**Do not integrate this prototype with production or real applicant evidence yet.** It is suitable as an isolated Stage 1 interaction prototype and documentation reference. Resolve the P0 and P1 items, inspect the existing marketplace repository, obtain final policy/legal approval, and then design the backend contract before beginning Stage 2 or production integration.

## References to inspected project files

- `src/App.tsx`
- `src/validation.ts`
- `src/types.ts`
- `src/declarations.ts`
- `src/services/mockSubmission.ts`
- `src/components/EvidenceUpload.tsx`
- `src/App.test.tsx`
- `src/services/mockSubmission.test.ts`
- `docs/integration-contract.md`
- `docs/policy-compliance-audit.md`
- `docs/policy-questions.md`
- `docs/stage-1-completion-report.md`
- `README.md`
