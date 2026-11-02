import type { ApplicantPath, BusinessType, DeclarationKey, EvidenceKey, MockSubmissionResponse, SubmissionRecord } from '../types'

export interface MockSubmissionInput {
  path: ApplicantPath
  businessType?: BusinessType
  correctionCount: number
  evidenceCategories: EvidenceKey[]
  declarationVersion: string
  declarationWordingStatus: string
  acknowledgedDeclarations: Array<{ key: DeclarationKey; acknowledgedAt: string }>
  declarationsAcceptedAt: string
}

export interface MockSubmissionService {
  submit(input: MockSubmissionInput): Promise<MockSubmissionResponse>
  requestCorrection(record: SubmissionRecord): SubmissionRecord
  close(record: SubmissionRecord, reason: string): SubmissionRecord
}

export function createMockSubmissionService(): MockSubmissionService {
  let sequence = 0
  return {
    async submit(input) {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      sequence += 1
      const record: SubmissionRecord = {
        id: `MOCK-${String(sequence).padStart(4, '0')}`,
        path: input.path,
        businessType: input.businessType,
        submittedAt: new Date().toISOString(),
        status: 'awaiting_review',
        event: 'submission',
        correctionCount: input.correctionCount,
        evidenceCategories: [...input.evidenceCategories],
        declarationVersion: input.declarationVersion,
        declarationWordingStatus: input.declarationWordingStatus,
        acknowledgedDeclarations: [...input.acknowledgedDeclarations],
        declarationsAcceptedAt: input.declarationsAcceptedAt,
      }
      return {
        record,
        simulated: true,
        message: input.correctionCount > 0
          ? 'Your corrected application has been recorded for review. This demonstration does not make a final decision.'
          : 'Your application has been recorded for review. This demonstration does not approve your seller account or grant seller access.',
      }
    },
    requestCorrection(record) {
      if (record.correctionCount >= 1) {
        return {
          ...record,
          status: 'closed',
          event: 'closed',
          closureReason: 'The single correction opportunity has already been used; no further correction is available.',
        }
      }
      return {
        ...record,
        status: 'correction_requested',
        event: 'correction_requested',
        correctionReason: 'Please provide clearer documents for the verification path you selected.',
        reviewerNote: 'This request is for clearer information only. It is not a finding of misconduct.',
      }
    },
    close(record, reason) {
      return { ...record, status: 'closed', event: 'closed', closureReason: reason }
    },
  }
}
