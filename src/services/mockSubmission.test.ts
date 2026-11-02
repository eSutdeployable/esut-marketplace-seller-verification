import { describe, expect, it } from 'vitest'
import { createMockSubmissionService } from './mockSubmission'

describe('mock submission adapter', () => {
  it('returns an awaiting-review result that is explicitly simulated', async () => {
    const service = createMockSubmissionService()
    const response = await service.submit({
      path: 'student',
      correctionCount: 0,
      evidenceCategories: ['courseRegistration', 'studentId'],
      declarationVersion: 'esut-seller-declarations-proposed-v1',
      declarationWordingStatus: 'proposed-wording-pending-final-policy-review',
      acknowledgedDeclarations: [{ key: 'accuracy', acknowledgedAt: '2026-11-01T00:00:00.000Z' }, { key: 'verification', acknowledgedAt: '2026-11-01T00:00:00.000Z' }],
      declarationsAcceptedAt: '2026-11-01T00:00:00.000Z',
    })
    expect(response.simulated).toBe(true)
    expect(response.record.status).toBe('awaiting_review')
    expect(response.message).toContain('does not approve your seller account')
    expect(response.record.evidenceCategories).toEqual(['courseRegistration', 'studentId'])
    expect(response.record.declarationVersion).toBe('esut-seller-declarations-proposed-v1')
    expect(response.record.declarationWordingStatus).toBe('proposed-wording-pending-final-policy-review')
    expect(response.record.acknowledgedDeclarations).toHaveLength(2)
    expect(response.record.declarationsAcceptedAt).toBe('2026-11-01T00:00:00.000Z')
  })

  it('allows one correction request and records a specific closure reason', async () => {
    const service = createMockSubmissionService()
    const response = await service.submit({
      path: 'business',
      businessType: 'unregistered-vendor',
      correctionCount: 0,
      evidenceCategories: ['identity', 'sellingActivity', 'communityConnection'],
      declarationVersion: 'esut-seller-declarations-proposed-v1',
      declarationWordingStatus: 'proposed-wording-pending-final-policy-review',
      acknowledgedDeclarations: [{ key: 'accuracy', acknowledgedAt: '2026-11-01T00:00:00.000Z' }, { key: 'verification', acknowledgedAt: '2026-11-01T00:00:00.000Z' }, { key: 'ownership', acknowledgedAt: '2026-11-01T00:00:00.000Z' }],
      declarationsAcceptedAt: new Date().toISOString(),
    })
    const correction = service.requestCorrection(response.record)
    expect(correction.status).toBe('correction_requested')
    expect(correction.correctionReason).toBeTruthy()
    expect(correction.reviewerNote).toContain('not a finding of misconduct')
    const closed = service.close({ ...correction, correctionCount: 1 }, 'Mock closure for testing')
    expect(closed.status).toBe('closed')
    expect(closed.closureReason).toBe('Mock closure for testing')
    const repeatCorrection = service.requestCorrection({ ...closed, correctionCount: 1 })
    expect(repeatCorrection.status).toBe('closed')
    expect(repeatCorrection.closureReason).toContain('single correction opportunity')
  })
})
