import type { ApplicantPath, BusinessType, DeclarationKey } from './types'

export type { DeclarationKey } from './types'

export type DeclarationDefinition = {
  key: DeclarationKey
  label: string
  text: string
}

export const DECLARATION_VERSION = 'esut-seller-declarations-proposed-v1'
export const DECLARATION_WORDING_STATUS = 'proposed-wording-pending-final-policy-review'

// Intentionally empty until an approved production Privacy Policy URL is supplied.
export const PRIVACY_POLICY_URL = ''

export const DECLARATION_CATALOG: Record<DeclarationKey, DeclarationDefinition> = {
  accuracy: {
    key: 'accuracy',
    label: 'Declaration 1 — Accuracy and authenticity',
    text: 'I confirm that the information and documents I have provided are genuine and accurate to the best of my knowledge.',
  },
  verification: {
    key: 'verification',
    label: 'Declaration 2 — Verification authorization',
    text: 'I authorize ESUT Marketplace to verify the information and documents I have submitted. I understand that approval of this application does not automatically activate a store or grant seller permissions.',
  },
  ownership: {
    key: 'ownership',
    label: 'Declaration 3 — Business ownership confirmation',
    text: 'I confirm that I am the owner of the registered business identified in this application.',
  },
  representative: {
    key: 'representative',
    label: 'Declaration 4 — Representative authorization confirmation',
    text: 'I confirm that I am authorized to submit this application on behalf of the business identified in it.',
  },
}

export function getApplicableDeclarationKeys(path: ApplicantPath, businessType?: BusinessType): DeclarationKey[] {
  if (path === 'student' || businessType === 'unregistered-vendor') return ['accuracy', 'verification']
  if (businessType === 'registered-owner') return ['accuracy', 'verification', 'ownership']
  if (businessType === 'authorized-representative') return ['accuracy', 'verification', 'representative']
  return ['accuracy', 'verification']
}
