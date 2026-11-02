export type ApplicantPath = 'student' | 'business'
export type BusinessType = 'registered-owner' | 'unregistered-vendor' | 'authorized-representative'
export type DeclarationKey = 'accuracy' | 'verification' | 'ownership' | 'representative'
export type DeclarationState = Record<DeclarationKey, boolean>
export type VerificationStatus = 'not_submitted' | 'submitting' | 'awaiting_review' | 'correction_requested' | 'approved' | 'closed'
export type EvidenceKey =
  | 'courseRegistration'
  | 'studentId'
  | 'jambLetter'
  | 'cacRegistration'
  | 'ownershipClaim'
  | 'identity'
  | 'sellingActivity'
  | 'communityConnection'
  | 'authorization'

export interface EvidenceFile {
  name: string
  size: number
  type: string
  lastModified?: number
}

export type EvidenceMap = Partial<Record<EvidenceKey, EvidenceFile>>
export type FieldValues = Record<string, string>
export type FieldErrors = Record<string, string>
export type SubmissionEvent = 'submission' | 'correction_requested' | 'closed'

export interface SubmissionRecord {
  id: string
  path: ApplicantPath
  businessType?: BusinessType
  submittedAt: string
  status: VerificationStatus
  event: SubmissionEvent
  correctionCount: number
  evidenceCategories: EvidenceKey[]
  declarationVersion: string
  declarationWordingStatus: string
  acknowledgedDeclarations: Array<{ key: DeclarationKey; acknowledgedAt: string }>
  declarationsAcceptedAt: string
  correctionReason?: string
  closureReason?: string
  reviewerNote?: string
}

export interface MockSubmissionResponse {
  record: SubmissionRecord
  simulated: true
  message: string
}

export const MOCK_ACCOUNT_EMAIL = 'test.account@esut.edu.ng'
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

export const initialFields: FieldValues = {
  fullName: '',
  registrationNumber: '',
  faculty: '',
  department: '',
  academicLevel: '',
  enrollmentYear: '',
  graduationYear: '',
  contactNumber: '',
  businessName: '',
  cacNumber: '',
  businessDescription: '',
  ownershipClaim: '',
  vendorName: '',
  productsServices: '',
  sellingActivity: '',
  communityConnection: '',
  representativeRole: '',
  authorizationType: 'signed-letter',
}
