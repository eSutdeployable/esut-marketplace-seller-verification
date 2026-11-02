import { describe, expect, it } from 'vitest'
import { validateBusiness, validateFile, validateStudent } from './validation'
import type { EvidenceFile } from './types'

const okFile: EvidenceFile = { name: 'evidence.pdf', size: 2000, type: 'application/pdf' }
const declarations = { accuracy: true, verification: true, ownership: false, representative: false }

describe('student verification rules', () => {
  const values = { fullName: 'Ada Student', registrationNumber: 'ESUT/24/001', faculty: 'Engineering', department: 'Computer Engineering', academicLevel: '300 level' }

  it('requires both the current registration form and one supporting document', () => {
    const errors = validateStudent(values, {}, declarations)
    expect(errors.courseRegistration).toContain('Upload')
    expect(errors.supportingDocument).toContain('either')
    expect(validateStudent(values, { courseRegistration: okFile, studentId: okFile }, declarations)).not.toHaveProperty('supportingDocument')
    expect(validateStudent(values, { courseRegistration: okFile, jambLetter: okFile }, declarations)).not.toHaveProperty('supportingDocument')
  })

  it('rejects invalid types and files over 5 MB', () => {
    expect(validateFile({ ...okFile, type: 'text/plain' })).toContain('PDF')
    expect(validateFile({ ...okFile, size: 5 * 1024 * 1024 + 1 })).toContain('5 MB')
  })
})

describe('business and vendor rules', () => {
  it('requires registered owner registration, ownership, and community evidence', () => {
    const errors = validateBusiness({ fullName: 'Owner' }, {}, 'registered-owner', declarations)
    expect(errors.businessName).toBeTruthy()
    expect(errors.cacRegistration).toBeTruthy()
    expect(errors.ownershipClaim).toBeTruthy()
    expect(errors.communityConnection).toBeTruthy()
  })

  it('does not require CAC registration for an unregistered vendor', () => {
    const values = { fullName: 'Vendor', vendorName: 'Campus Prints', productsServices: 'Printing', sellingActivity: 'Weekly campus orders', communityConnection: 'ESUT alumni network' }
    const files = { identity: okFile, sellingActivity: okFile, communityConnection: okFile }
    const errors = validateBusiness(values, files, 'unregistered-vendor', declarations)
    expect(errors).not.toHaveProperty('cacNumber')
    expect(errors).not.toHaveProperty('cacRegistration')
  })

  it('requires authorization evidence for representatives', () => {
    const values = { fullName: 'Rep', businessName: 'Acme', cacNumber: 'RC123', representativeRole: 'Manager', communityConnection: 'ESUT supplier' }
    const errors = validateBusiness(values, { cacRegistration: okFile, communityConnection: okFile }, 'authorized-representative', declarations)
    expect(errors.authorization).toContain('Authorization evidence')
  })

  it('requires both common declarations', () => {
    const errors = validateStudent({}, {}, { ...declarations, verification: false })
    expect(errors.verificationDeclaration).toBeTruthy()
  })

  it('requires only the applicable conditional declaration', () => {
    expect(validateBusiness({ fullName: 'Owner' }, {}, 'registered-owner', declarations).ownershipDeclaration).toBeTruthy()
    expect(validateBusiness({ fullName: 'Rep' }, {}, 'authorized-representative', declarations).representativeDeclaration).toBeTruthy()
    expect(validateBusiness({ fullName: 'Vendor' }, {}, 'unregistered-vendor', declarations)).not.toHaveProperty('ownershipDeclaration')
    expect(validateBusiness({ fullName: 'Student' }, {}, 'registered-owner', { ...declarations, ownership: true }).ownershipDeclaration).toBeUndefined()
  })
})
