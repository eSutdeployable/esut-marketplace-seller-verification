# ESUT Marketplace Form 1 — Seller Verification

This repository contains an isolated React implementation of Form 1 for ESUT Marketplace seller verification. It is intentionally limited to applicant-facing seller verification. The Store application, reviewer dashboard, production database, authentication, seller permissions, and public evidence storage are not implemented.

## Run locally

```bash
npm install
npm run dev
```

The Vite development server listens on port 3000. Run the verification suite with `npm test`, check types with `npm run typecheck`, and create a production bundle with `npm run build`.

## Implemented applicant paths

The student path requires a current academic-session course registration form plus either an ESUT student ID card or a JAMB admission letter. The registered-business path requires CAC registration evidence, ownership-claim evidence, and ESUT-community evidence. The unregistered-vendor path requires identity, genuine selling-activity, and ESUT-community evidence without requiring CAC registration. The authorized-representative path requires business registration, ESUT-community, and authorization evidence. Authorization supports the preferred signed Business Authorization Letter, an Appointment or Employment Letter, or another credible document bearing either a valid stamp or the granting authority's signature.

## Architecture

`src/App.tsx` owns applicant interaction state and renders the conditional form. `src/validation.ts` contains the four policy-specific evidence paths and declaration rules. `src/components/EvidenceUpload.tsx` is an in-memory upload abstraction: it stores only safe metadata in React state and never writes file contents to browser storage. `src/services/mockSubmission.ts` defines the future submission boundary and simulates an awaiting-review result, one correction request, and a specific closure reason without granting permissions. `src/types.ts` is the shared contract.

## Mocked and incomplete behavior

The authenticated email is a clearly labelled synthetic fixture. File contents are not uploaded anywhere. Submission history exists only in the active page session, and the mock adapter is not a reviewer or an authoritative status service. The correction workflow permits one correction per application and displays a specific mock reason; production must supply authoritative reasons and status transitions. Approved and closed outcomes are simulation states only. The proposed declaration version is `esut-seller-declarations-proposed-v1` with status `proposed-wording-pending-final-policy-review`; it must not be described as legally approved or finalized.

## Declaration and privacy policy note

The UI displays the four exact proposed declaration strings supplied for this prototype and labels them **Proposed wording — pending final policy review**. Accuracy and verification apply to all applicants; ownership applies only to Registered Business Owner; representative authority applies only to Authorized Representative of Registered Business. Hidden conditional acknowledgements are cleared when the applicant type changes.

The privacy notice is separate from the declarations and reads **Privacy information pending final policy review**. No Privacy Policy URL, retention period, lawful basis, controller identity, privacy contact, or separate consent checkbox is invented. See `docs/policy-questions.md` for the unresolved production decisions.
