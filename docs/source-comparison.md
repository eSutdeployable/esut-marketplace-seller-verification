# Seller-form source comparison and recreation notes

## What the supplied source does well

The supplied `RedesignSellerApplicationForm` source is a polished seller-onboarding wizard rather than a long document form. Its strongest patterns are:

- A true four-step journey: application type, details, evidence, and declarations.
- A dark seller-confidence progress rail with short, scannable stage descriptions.
- Large applicant-type cards with clear icons, selection state, and tailored descriptions.
- Step-scoped validation so applicants only solve the current section’s problems.
- Consistent inline SVG icons for identity, contact, documents, privacy, upload, and status.
- Evidence cards that show the selected file, file metadata, replace/remove affordances, and private-mock messaging.
- A dedicated privacy/declarations stage that makes the final review decision feel intentional.
- A status view with application reference, history, correction workflow, approval state, and Store application as an explicitly locked future stage.

## Comparison with the original standalone ESUT form

Before this recreation, the ESUT form had a strong policy and validation foundation but a flatter interaction model:

- The original UI showed most of the form in one long scroll surface.
- Progress focused on two broad stages: Seller verification and Store application.
- Applicant selection used two primary path buttons followed by a second business/vendor selector.
- Validation was safe and path-specific, but the user encountered many fields and evidence cards before a clear completion rhythm was established.
- The original design already had good responsive behavior, evidence privacy messaging, accessible error summaries, mock status controls, and a red submission action.

## What was recreated

The current project now combines the source’s stronger UX patterns with the existing ESUT policy behavior:

1. The form is a real four-step wizard. Continue and Back move through application type, details, evidence, and declarations. Validation is filtered to the active step.
2. The left rail is now a dark Seller Journey panel with a confidence message, four stages, a private-by-design note, and the future Store application boundary.
3. The main hero now positions the experience as “Build trust before you sell” and exposes private review, approximate duration, and the future Store boundary as concise metadata.
4. A horizontal step strip gives users a second way to understand and move through the form without losing their place.
5. The source’s card-based applicant choice and icon language were adapted to the existing Student / Business or Vendor model, preserving the existing path-specific business choices.
6. Evidence and declaration surfaces remain compatible with the existing in-memory evidence model and mock submission adapter. A privacy-review panel was added to the declarations step.
7. Existing correction history, one-correction enforcement, declaration metadata, private evidence behavior, and Store boundary remain intact.

## What was intentionally not copied

The supplied source persists its mock application through `localStorage`. The current ESUT project intentionally keeps evidence and workflow state in React memory for this standalone prototype, so no localStorage persistence was added. The supplied source also uses an external Unsplash image in its progress panel; the recreation uses a CSS-generated seller-confidence visual instead of introducing an external image dependency.

The source’s finalized declaration constants are also not treated as authoritative because the audit identified that the approved policy source is absent from the standalone workspace. The existing project’s declaration caveat and unconfirmed policy version remain unchanged.

## Validation after recreation

- `npm test`: 17 tests passing.
- `npm run typecheck`: passing.
- `npm run build`: passing.
- Desktop and mobile Preview screenshots checked.
- No authentication, production database, production storage, marketplace role, or Store application integration was added.
