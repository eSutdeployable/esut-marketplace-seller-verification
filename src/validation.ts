import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  type ApplicantPath,
  type BusinessType,
  type DeclarationState,
  type EvidenceFile,
  type EvidenceMap,
  type FieldErrors,
  type FieldValues,
} from './types'

export function validateFile(file: EvidenceFile | undefined): string | undefined {
  if (!file) return 'Upload a document to continue.'
  if (!ACCEPTED_FILE_TYPES.includes(file.type as (typeof ACCEPTED_FILE_TYPES)[number])) return 'Use a PDF, JPG, or PNG file.'
  if (file.size > MAX_FILE_SIZE) return 'Each document must be 5 MB or smaller.'
  return undefined
}

function required(values: FieldValues, errors: FieldErrors, key: string, label: string) {
  if (!values[key]?.trim()) errors[key] = `${label} is required.`
}

function evidence(errors: FieldErrors, files: EvidenceMap, key: keyof EvidenceMap, label: string) {
  const message = validateFile(files[key])
  if (message) errors[key] = `${label}: ${message}`
}

export function validateStudent(values: FieldValues, files: EvidenceMap, declarations: DeclarationState): FieldErrors {
  const errors: FieldErrors = {}
  required(values, errors, 'fullName', 'Full legal name')
  required(values, errors, 'registrationNumber', 'ESUT matriculation/registration number')
  required(values, errors, 'faculty', 'Faculty')
  required(values, errors, 'department', 'Department')
  required(values, errors, 'academicLevel', 'Current academic level')
  evidence(errors, files, 'courseRegistration', 'Current academic-session course registration form')
  if (!files.studentId && !files.jambLetter) {
    errors.supportingDocument = 'Upload either an ESUT student ID card or a JAMB admission letter.'
  } else {
    if (files.studentId) {
      const studentIdError = validateFile(files.studentId)
      if (studentIdError) errors.studentId = `ESUT student ID card: ${studentIdError}`
    }
    if (files.jambLetter) {
      const jambError = validateFile(files.jambLetter)
      if (jambError) errors.jambLetter = `JAMB admission letter: ${jambError}`
    }
  }
  validateDeclarations(errors, declarations)
  return errors
}

export function validateBusiness(values: FieldValues, files: EvidenceMap, type: BusinessType, declarations: DeclarationState): FieldErrors {
  const errors: FieldErrors = {}
  required(values, errors, 'fullName', 'Full legal name')
  if (type === 'registered-owner') {
    required(values, errors, 'businessName', 'Registered business name')
    required(values, errors, 'cacNumber', 'CAC registration number')
    required(values, errors, 'businessDescription', 'Business description')
    required(values, errors, 'ownershipClaim', 'Ownership claim')
    required(values, errors, 'communityConnection', 'ESUT community connection')
    evidence(errors, files, 'cacRegistration', 'CAC registration evidence')
    evidence(errors, files, 'ownershipClaim', 'Ownership claim evidence')
    evidence(errors, files, 'communityConnection', 'ESUT community connection evidence')
  }
  if (type === 'unregistered-vendor') {
    required(values, errors, 'vendorName', 'Vendor or trading name')
    required(values, errors, 'productsServices', 'Products or services')
    required(values, errors, 'sellingActivity', 'Selling activity')
    required(values, errors, 'communityConnection', 'ESUT community connection')
    evidence(errors, files, 'identity', 'Identity evidence')
    evidence(errors, files, 'sellingActivity', 'Genuine selling activity evidence')
    evidence(errors, files, 'communityConnection', 'ESUT community connection evidence')
  }
  if (type === 'authorized-representative') {
    required(values, errors, 'businessName', 'Registered business name')
    required(values, errors, 'cacNumber', 'CAC registration number')
    required(values, errors, 'representativeRole', 'Role in the business')
    required(values, errors, 'communityConnection', 'ESUT community connection')
    evidence(errors, files, 'cacRegistration', 'Business registration evidence')
    evidence(errors, files, 'communityConnection', 'ESUT community connection evidence')
    evidence(errors, files, 'authorization', 'Authorization evidence')
  }
  validateDeclarations(errors, declarations, type)
  return errors
}

function validateDeclarations(errors: FieldErrors, declarations: DeclarationState, businessType?: BusinessType) {
  if (!declarations.accuracy) errors.accuracyDeclaration = 'Acknowledge the accuracy and authenticity declaration to continue.'
  if (!declarations.verification) errors.verificationDeclaration = 'Acknowledge the verification authorization declaration to continue.'
  if (businessType === 'registered-owner' && !declarations.ownership) errors.ownershipDeclaration = 'Acknowledge the business ownership declaration to continue.'
  if (businessType === 'authorized-representative' && !declarations.representative) errors.representativeDeclaration = 'Acknowledge the representative authorization declaration to continue.'
}

export function validatePath(path: ApplicantPath, values: FieldValues, files: EvidenceMap, businessType: BusinessType, declarations: DeclarationState): FieldErrors {
  return path === 'student' ? validateStudent(values, files, declarations) : validateBusiness(values, files, businessType, declarations)
}
