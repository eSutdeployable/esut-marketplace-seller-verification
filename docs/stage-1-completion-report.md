# ESUT Marketplace — Stage 1 Completion Report

**Stage:** Form 1 — Seller Verification  
**Project:** ESUT Marketplace Seller Verification  
**Repository:** Isolated managed React/Vite project  
**Current checkpoint:** `95e75de64ec835c3f9b0429786825ee7ad69a107`  
**Branch:** `main`  
**Status:** Stage 1 complete as a standalone prototype; Stage 2 has not started.

## 1. Executive summary

Stage 1 delivers an applicant-facing seller-verification form for ESUT Marketplace. It supports the four required applicant paths, path-specific applicant information, evidence requirements, declarations, accessible validation, a one-correction workflow, preserved mock application history, and responsive desktop/mobile navigation.

The application is intentionally isolated from the existing marketplace. It does not authenticate real users, upload evidence, persist production records, grant seller permissions, approve applicants, or open a store. The Store application remains a separate future stage.

## 2. Functional scope completed

### Applicant paths

The form supports:

1. ESUT student.
2. Registered business owner.
3. Unregistered individual vendor.
4. Authorized representative of a registered business.

The business/vendor branch explicitly distinguishes CAC-registered owners, unregistered vendors, and authorized representatives.

### Student verification

The student path collects identity and academic context, including matriculation or registration number, faculty, department, and current academic level. It requires:

- A current academic-session course registration form.
- Either an ESUT student ID card or a JAMB admission letter.

The UI expresses the current-session requirement, while factual verification of the session remains a backend/reviewer responsibility.

### Business and vendor verification

The registered-owner path requires business information and evidence for:

- CAC registration.
- Ownership claim.
- ESUT community connection.

The unregistered-vendor path requires:

- Identity.
- Proof of genuine selling activity.
- ESUT community connection.
- No CAC registration requirement.

The authorized-representative path requires:

- Registered business details.
- ESUT community connection.
- Authority to represent the business.

It supports the preferred signed Business Authorization Letter, Appointment or Employment Letter, and another credible authorization document with either a valid stamp or the granting authority’s signature. Both marks are not required.

### Guided four-step journey

The form is organized into four navigable sections:

1. Application type.
2. Your details.
3. Evidence.
4. Declarations.

Each step has scoped validation, Continue and Back controls, progress indicators, and a compact navigation strip. Future steps remain unavailable until the applicant reaches them in sequence.

### Evidence handling

The evidence UI:

- Accepts PDF, JPG, and PNG metadata.
- Enforces the 5 MB client-side limit.
- Shows clear document descriptions and replacement states.
- Keeps file contents in memory only.
- Does not write evidence to localStorage or public storage.
- Explains that documents are used for the application only.

### Declarations and privacy

The final step includes exact proposed declaration wording, required acknowledgement checkboxes, conditional ownership or representative-authority declarations, per-acknowledgement timestamps, and a separate privacy-information panel. The wording is explicitly marked **Proposed wording — pending final policy review** with version `esut-seller-declarations-proposed-v1`; it is not described as legally approved or finalized. The Privacy Policy URL remains unconfigured.

### Review and correction workflow

The mock submission adapter supports:

- Awaiting-review state.
- Duplicate-submit protection.
- One correction request.
- Corrected resubmission.
- Closure after the correction opportunity is exhausted.
- Preserved application update history.
- Evidence-category metadata.
- Declaration version and acceptance timestamp metadata.
- Reviewer-note and correction-reason fields.

Mock outcomes are clearly presented as demonstrations and do not grant seller access or create a store.

## 3. Design and UX work completed

The form went through several design passes based on the supplied screenshots and redesign source.

### Formal ESUT service layout

The final experience uses a restrained institutional layout rather than a promotional landing page:

- ESUT Marketplace header and seller-verification context.
- Formal editorial serif headings paired with readable DM Sans body text.
- Calm neutral surfaces, ESUT green accents, and restrained red action controls.
- Plain-language instructions and applicant-centered button labels.
- Four-step progress navigation with clear section descriptions.
- Responsive mobile stacking without page-level horizontal overflow.

### Marketplace storefront context

The latest sidebar update adds a compact storefront identity card containing:

- ESUT Marketplace mark.
- Seller centre label.
- Form 1 seller-verification context.
- “The first step towards opening your marketplace store” explanation.

This gives the verification step a clear relationship to the future storefront without prematurely implementing Stage 2.

### Copy refinement

Technical and generic wording was rewritten, including:

- “Choose evidence” → “Upload document”.
- “No file selected” → “No document added yet”.
- “Mock review controls” → “Review demonstration”.
- “Submission history” → “Application updates”.
- “Secure seller onboarding” → “Your information is private”.
- “Apply as an ESUT Student” → “I am an ESUT student”.
- “Apply as a Business or Vendor” → “I represent a business or sell independently”.

## 4. Technical implementation completed

The project uses React, TypeScript, Vite, and Vitest. Main responsibilities are separated as follows:

- `src/App.tsx`: applicant state, four-step navigation, conditional fields, declarations, submission states, and mock review controls.
- `src/validation.ts`: applicant-path rules, required fields, file metadata validation, declarations, and path-specific evidence rules.
- `src/components/ProgressSidebar.tsx`: four-step progress rail and storefront context card.
- `src/components/EvidenceUpload.tsx`: private in-memory document metadata interaction.
- `src/services/mockSubmission.ts`: mock submission boundary, one-correction logic, closure, and update history.
- `src/types.ts`: shared applicant, evidence, declaration, status, and submission contracts.
- `docs/integration-contract.md`: future frontend/backend boundary.
- `docs/policy-compliance-audit.md`: implementation and policy-compliance audit.
- `docs/policy-questions.md`: unresolved production decisions.
- `docs/source-comparison.md`: comparison of the supplied redesign source and the ESUT implementation.

## 5. Verification evidence

The current implementation has been verified with:

- `npm test`: **17 tests passed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**.
- Preview reload at desktop width.
- Preview reload at mobile width.
- Preview reload at the supplied tablet-sized edit viewport.
- Route manifest response verified at `/manus-routes.json`.
- Git diff whitespace check passed.
- Working tree clean at the current checkpoint.

The test suite covers:

- Conditional applicant paths.
- Hidden-field reset when switching paths.
- Step-level validation and accessible error summaries.
- Duplicate submission prevention.
- No evidence persistence in browser storage.
- Submission, correction, corrected resubmission, and closure history.
- All four validation branches and file rules.
- Mock metadata preservation and one-correction enforcement.

## 6. Checkpoint history

Relevant completed checkpoints:

- `0d29056` — formal guided seller service layout.
- `c3e7242` — typography and applicant-language refinement.
- `95e75de` — ESUT Marketplace storefront context card and responsive sidebar correction.

The latest checkpoint is pushed to `origin/main`.

## 7. Known limitations and production blockers

Stage 1 is not production-integrated. Before production use, the following must be resolved:

1. Supply and approve the exact verbatim declaration policy text and version.
2. Define how the current academic session is identified and verified.
3. Connect authenticated account identity and server-side authorization.
4. Implement private evidence upload and access control.
5. Repeat file MIME, content, and size validation on the server.
6. Bind submissions to authenticated accounts and enforce idempotency.
7. Persist immutable attempts, evidence references, declarations, reviewer decisions, correction events, and closure reasons.
8. Confirm ESUT-community connection evidence standards.
9. Define retention, deletion, encryption, and reviewer-access rules.
10. Confirm the approved privacy and verification-information URL.
11. Confirm the real marketplace route, existing router, backend procedures, schema, and permission model.

## 8. Stage 2 readiness and recommended boundary

Stage 2 should be treated as a separate Store application flow that is unlocked only after an authoritative seller-verification approval. It should not be implemented as a continuation of the current mock submit action.

Recommended Stage 2 scope:

- Store profile and storefront identity.
- Store name and public description.
- Store category and product/service category.
- Contact and fulfillment information.
- Store policies and customer-facing expectations.
- Storefront preview.
- Submission for separate store review or activation.

Recommended Stage 2 boundary:

- The seller-verification record remains the prerequisite.
- The backend, not the browser, determines whether Stage 2 is available.
- Store application data must be separate from private verification evidence.
- Seller approval must not automatically publish a store.
- Store application review and seller-verification review should have separate status and audit history.

## 9. Stage 1 completion decision

**Stage 1 is complete for isolated prototype delivery.**

The project is ready for a Stage 2 planning pass, but not yet ready for production Store application integration. Stage 2 implementation should begin only after the route, backend ownership, store data fields, approval gate, and production policy decisions are confirmed.
