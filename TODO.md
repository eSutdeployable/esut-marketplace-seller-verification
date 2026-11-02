# ESUT Marketplace Form 1 — Implementation checklist

## Core verification experience
- [x] Implement a standalone React Form 1 module for seller verification only; the Store application remains a future stage.
- [x] Preserve the supplied ESUT Marketplace visual direction: pale neutral background, progress sidebar, rounded application card, green verification accents, familiar spacing and typography, responsive mobile stacking, and red submit action.
- [x] Provide four selectable paths: ESUT Student, Registered Business Owner, Unregistered Individual Vendor, and Authorized Representative of a Registered Business.
- [x] Changing paths resets conditional fields and evidence so hidden stale fields cannot be submitted.

## Evidence and policy rules
- [x] Students must provide a current academic-session course registration form and either an ESUT student ID card or a JAMB admission letter.
- [x] Registered business owners must provide CAC registration evidence, ownership-claim evidence, and ESUT community-connection evidence.
- [x] Unregistered individual vendors must provide identity evidence, genuine selling-activity evidence, and ESUT community-connection evidence; CAC registration is not required.
- [x] Authorized representatives must provide business-registration evidence, ESUT community-connection evidence, and one authorization option: signed Business Authorization Letter (preferred), Appointment or Employment Letter, or another credible authorization document bearing either a valid stamp or the granting authority's signature.
- [x] Implement both mandatory policy declarations and block submission until both are accepted.

## Submission workflow and safeguards
- [x] Implement accessible labels, inline validation, an error summary, keyboard-operable choices, visible focus states, and screen-reader status announcements.
- [x] Keep evidence in private in-memory abstractions; never persist evidence in localStorage/sessionStorage or expose it through public URLs.
- [x] Use synthetic data and a mock submission adapter; mock outcomes must not grant real seller permissions.
- [x] Provide meaningful submission states, duplicate-submission prevention, one correction opportunity per path, preserved submission history, and specific correction and closure reasons.

## Verification and handoff
- [x] Add automated tests for all applicant paths, evidence rules, declarations, stale-field prevention, duplicate submission, mock approval distinction, correction workflow, and insecure storage safeguards.
- [x] Add setup and run instructions.
- [x] Add a future integration contract.
- [x] Add documentation of mocked or incomplete functionality and unresolved production policy decisions.
- [x] Run typecheck, tests, and production build; report actual results: `npm run typecheck`, `npm test` (12 tests passed), and `npm run build` all completed successfully.
