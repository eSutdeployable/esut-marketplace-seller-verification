import { describe, expect, it } from 'vitest'
import { DECLARATION_CATALOG, DECLARATION_VERSION, DECLARATION_WORDING_STATUS, getApplicableDeclarationKeys, PRIVACY_POLICY_URL } from './declarations'

describe('proposed seller declarations', () => {
  it('keeps the exact proposed wording and pending status', () => {
    expect(DECLARATION_CATALOG.accuracy.text).toBe('I confirm that the information and documents I have provided are genuine and accurate to the best of my knowledge.')
    expect(DECLARATION_CATALOG.verification.text).toBe('I authorize ESUT Marketplace to verify the information and documents I have submitted. I understand that approval of this application does not automatically activate a store or grant seller permissions.')
    expect(DECLARATION_CATALOG.ownership.text).toBe('I confirm that I am the owner of the registered business identified in this application.')
    expect(DECLARATION_CATALOG.representative.text).toBe('I confirm that I am authorized to submit this application on behalf of the business identified in it.')
    expect(DECLARATION_VERSION).toBe('esut-seller-declarations-proposed-v1')
    expect(DECLARATION_WORDING_STATUS).toBe('proposed-wording-pending-final-policy-review')
  })

  it('shows common declarations for all paths and only the relevant conditional declaration', () => {
    expect(getApplicableDeclarationKeys('student')).toEqual(['accuracy', 'verification'])
    expect(getApplicableDeclarationKeys('business', 'registered-owner')).toEqual(['accuracy', 'verification', 'ownership'])
    expect(getApplicableDeclarationKeys('business', 'unregistered-vendor')).toEqual(['accuracy', 'verification'])
    expect(getApplicableDeclarationKeys('business', 'authorized-representative')).toEqual(['accuracy', 'verification', 'representative'])
  })

  it('does not invent a Privacy Policy URL', () => {
    expect(PRIVACY_POLICY_URL).toBe('')
  })
})
