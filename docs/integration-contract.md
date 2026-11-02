# Future integration contract

This standalone module is not connected to the existing ESUT Marketplace. The future integration should keep the React/Vite applicant UI separate from the authoritative Express/tRPC backend and the existing MySQL/Drizzle data layer. If the marketplace uses Wouter for client routing, Form 1 can be mounted at the existing seller-verification route without introducing a second router. No concrete production endpoint, table, or authentication mechanism is invented here.

## Request shape

The frontend should call an authenticated tRPC mutation or equivalent submission service rather than decide approval locally. The client sends a path-specific payload with applicant fields, a private upload reference for each evidence category, declaration acknowledgements, the declaration version presented to the applicant, the acceptance timestamp, and an idempotency key. The client must not send or trust a client-supplied approval state, reviewer role, marketplace seller role, or arbitrary account ID.

```ts
{
  applicantPath: 'student' | 'business',
  businessType?: 'registered-owner' | 'unregistered-vendor' | 'authorized-representative',
  applicantFields: Record<string, string>,
  evidence: Array<{ category: string, privateUploadId: string }>,
  declarations: {
    acknowledged: Array<{ key: 'accuracy' | 'verification' | 'ownership' | 'representative', acknowledgedAt: string }>,
    version: 'esut-seller-declarations-proposed-v1',
    wordingStatus: 'proposed-wording-pending-final-policy-review',
    acceptedAt: string
  },
  idempotencyKey: string
}
```

The upload service must validate MIME signatures/extensions and size server-side, store evidence privately, and return references accessible only to the applicant and authorized reviewers. A MySQL/Drizzle implementation should preserve immutable submission attempts, evidence references, declaration acceptance metadata, correction events, decisions, and reviewer notes rather than overwriting the original attempt.

## Response shape

```ts
{
  applicationId: string,
  status: 'awaiting_review' | 'correction_requested' | 'approved' | 'closed',
  submittedAt: string,
  correctionCount: number,
  correctionReason?: string,
  closureReason?: string,
  reviewerNote?: string
}
```

The server is authoritative for status and correction limits. A correction request must include a reviewer-provided reason and must not be treated as an automatic fraud finding. The one-correction rule applies across all four applicant paths; after the correction is submitted, a subsequent correction request must be rejected or the application closed according to the production policy. A corrected submission that fails review must be closed with a specific authoritative reason.

## Client-side versus backend enforcement

The standalone client performs usability validation: required fields, selected path conditions, accepted file type metadata, the 5 MB client-side limit, declaration checkboxes, duplicate-click protection, and accessible errors. The future backend must repeat and strengthen every security-sensitive check: authenticated account binding, path and role authorization, file-content/type/size validation, private storage access control, current-session evidence verification, account ownership, ESUT connection review, declaration version verification, idempotency, correction-limit enforcement, authoritative status transitions, reviewer permissions, and audit-history persistence. Client-side approval or seller-role values must never be authoritative.

## Current declaration and privacy caveat

The standalone workspace now records the four exact proposed declaration strings supplied for prototype use. They are labelled **Proposed wording — pending final policy review** and use version `esut-seller-declarations-proposed-v1` with status `proposed-wording-pending-final-policy-review`. The client records only the declarations applicable to the selected applicant type: accuracy and verification for everyone, ownership for registered business owners, and representative authority for authorized representatives. Unregistered vendors receive no conditional business declaration.

The privacy notice is intentionally separate from the declarations. The configurable Privacy Policy URL is empty until an approved production URL is supplied. No privacy consent checkbox, lawful basis, retention period, controller identity, contact address, encryption claim, or rights process is invented by this prototype.
