import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { EvidenceUpload } from './components/EvidenceUpload'
import { ProgressSidebar } from './components/ProgressSidebar'
import { createMockSubmissionService } from './services/mockSubmission'
import { DECLARATION_CATALOG, DECLARATION_VERSION, DECLARATION_WORDING_STATUS, getApplicableDeclarationKeys, PRIVACY_POLICY_URL } from './declarations'
import { initialFields, MOCK_ACCOUNT_EMAIL, type ApplicantPath, type BusinessType, type DeclarationKey, type DeclarationState, type EvidenceKey, type EvidenceMap, type FieldErrors, type FieldValues, type SubmissionRecord, type VerificationStatus } from './types'
import { validatePath } from './validation'

const businessOptions: Array<{ value: BusinessType; title: string; description: string }> = [
  { value: 'registered-owner', title: 'Registered business owner', description: 'For a business owner with CAC registration and an ESUT community connection.' },
  { value: 'unregistered-vendor', title: 'Independent individual vendor', description: 'For a genuine vendor without CAC registration. CAC is not required for this path.' },
  { value: 'authorized-representative', title: 'Authorized representative', description: 'For someone permitted to act for a registered business.' },
]

const journeySteps = [
  { id: 'application-type', label: 'Application type' },
  { id: 'your-details', label: 'Your details' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'declarations', label: 'Declarations' },
]

const evidenceErrorKeys = new Set([
  'courseRegistration',
  'studentId',
  'jambLetter',
  'cacRegistration',
  'ownershipClaim',
  'identity',
  'sellingActivity',
  'communityConnection',
  'authorization',
  'supportingDocument',
])

function scrollToTop() {
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Field({ label, name, value, onChange, error, disabled, type = 'text', placeholder, required = true }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; error?: string; disabled?: boolean; type?: string; placeholder?: string; required?: boolean }) {
  const errorId = `${name}-error`
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="required-mark">Required</span>}</label>
      <input id={name} name={name} type={type} value={value} placeholder={placeholder} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(name, event.target.value)} />
      {error && <span className="field-error" id={errorId} role="alert">{error}</span>}
    </div>
  )
}

function Textarea({ label, name, value, onChange, error, disabled, placeholder, required = true }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; error?: string; disabled?: boolean; placeholder?: string; required?: boolean }) {
  const errorId = `${name}-error`
  return (
    <div className="field full-width">
      <label htmlFor={name}>{label}{required && <span className="required-mark">Required</span>}</label>
      <textarea id={name} name={name} value={value} placeholder={placeholder} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(name, event.target.value)} />
      {error && <span className="field-error" id={errorId} role="alert">{error}</span>}
    </div>
  )
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children}</div>
}

function ApplicantIcon({ kind }: { kind: 'student' | 'business' }) {
  return kind === 'student' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="7" r="3.2" /><path d="M5.5 20c.6-3.3 2.8-5.1 6.5-5.1s5.9 1.8 6.5 5.1" /><path d="M4 11.5h4M16 11.5h4" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20V8.5L12 4l8 4.5V20" /><path d="M3 20h18M7 11h2v5H7zM11 11h2v5h-2zM15 11h2v5h-2z" /><path d="M3 8.5h18" /></svg>
  )
}

export function App() {
  const service = useMemo(() => createMockSubmissionService(), [])
  const [path, setPath] = useState<ApplicantPath>('student')
  const [businessType, setBusinessType] = useState<BusinessType>('registered-owner')
  const [fields, setFields] = useState<FieldValues>({ ...initialFields })
  const [files, setFiles] = useState<EvidenceMap>({})
  const [declarations, setDeclarations] = useState<DeclarationState>({ accuracy: false, verification: false, ownership: false, representative: false })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<VerificationStatus>('not_submitted')
  const [record, setRecord] = useState<SubmissionRecord | undefined>()
  const [history, setHistory] = useState<SubmissionRecord[]>([])
  const [correctionCount, setCorrectionCount] = useState(0)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('application-type')
  const [currentStep, setCurrentStep] = useState(0)

  const editing = status === 'not_submitted' || status === 'correction_requested'
  const disabled = status === 'submitting' || !editing
  const activeDeclarationKeys: DeclarationKey[] = getApplicableDeclarationKeys(path, businessType)
  const activeDeclarations = activeDeclarationKeys.map((key) => DECLARATION_CATALOG[key])

  function resetForPath(nextPath: ApplicantPath) {
    setPath(nextPath)
    setBusinessType('registered-owner')
    setFields({ ...initialFields })
    setFiles({})
    setDeclarations({ accuracy: false, verification: false, ownership: false, representative: false })
    setErrors({})
    setMessage('')
    setStatus('not_submitted')
    setRecord(undefined)
    setCorrectionCount(0)
    setActiveSection('application-type')
    setCurrentStep(0)
  }

  function jumpToSection(id: string, index: number) {
    if (index > currentStep + 1 || !editing) return
    setActiveSection(id)
    setCurrentStep(index)
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  function validateCurrentStep() {
    const allErrors = validatePath(path, fields, files, businessType, declarations)
    if (currentStep === 0) return {}
    if (currentStep === 1) return Object.fromEntries(Object.entries(allErrors).filter(([key]) => !evidenceErrorKeys.has(key) && !key.endsWith('Declaration')))
    if (currentStep === 2) return Object.fromEntries(Object.entries(allErrors).filter(([key]) => evidenceErrorKeys.has(key)))
    return Object.fromEntries(Object.entries(allErrors).filter(([key]) => key.endsWith('Declaration')))
  }

  function updateField(name: string, value: string) {
    setFields((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  function updateFile(key: EvidenceKey, file: EvidenceMap[EvidenceKey]) {
    setFiles((current) => {
      const next = { ...current }
      if (file) next[key] = file
      else delete next[key]
      return next
    })
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
    if (key === 'studentId' || key === 'jambLetter') setErrors((current) => ({ ...current, supportingDocument: '' }))
  }

  function updateDeclaration(key: DeclarationKey, checked: boolean) {
    setDeclarations((current) => ({ ...current, [key]: checked }))
    if (checked) setErrors((current) => ({ ...current, [`${key}Declaration`]: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return
    const nextErrors = validateCurrentStep()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setMessage('Review the highlighted items before submitting.')
      window.setTimeout(() => document.getElementById('error-summary')?.focus(), 0)
      return
    }
    if (currentStep < journeySteps.length - 1) {
      const nextStep = currentStep + 1
      setErrors({})
      setActiveSection(journeySteps[nextStep].id)
      setCurrentStep(nextStep)
      scrollToTop()
      return
    }
    setErrors({})
    setMessage('')
    setStatus('submitting')
    const acceptedAt = new Date().toISOString()
    const response = await service.submit({
      path,
      businessType: path === 'business' ? businessType : undefined,
      correctionCount,
      evidenceCategories: Object.keys(files) as EvidenceKey[],
      declarationVersion: DECLARATION_VERSION,
      declarationWordingStatus: DECLARATION_WORDING_STATUS,
      acknowledgedDeclarations: activeDeclarations.map(({ key }) => ({ key, acknowledgedAt: acceptedAt })),
      declarationsAcceptedAt: acceptedAt,
    })
    setRecord(response.record)
    setHistory((current) => [...current, response.record])
    setStatus(response.record.status)
    setMessage(response.message)
  }

  function requestCorrection() {
    if (!record || correctionCount > 0) return
    const next = service.requestCorrection(record)
    setRecord(next)
    setHistory((current) => [...current, next])
    setCorrectionCount(1)
    setStatus(next.status)
    setCurrentStep(2)
    setActiveSection('evidence')
    setMessage('A single correction opportunity has been opened. Review the reason and submit corrected evidence once.')
    setErrors({})
  }

  function closeApplication() {
    if (!record) return
    const next = service.close(record, 'Mock closure: the correction opportunity was not used within the review window.')
    setRecord(next)
    setHistory((current) => [...current, next])
    setStatus(next.status)
    setMessage('This is a simulated closure reason. No production application was changed.')
  }

  const correctionReason = record?.correctionReason
  const closureReason = record?.closureReason

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">E</div>
        <div><strong>ESUT Marketplace</strong><span>Seller verification</span></div>
        <div className="topbar-actions"><span className="secure-pill"><span className="secure-dot" /> Your information is private</span><span className="topbar-divider" aria-hidden="true" /></div>
        <div className="mock-account"><span>Application account</span><strong>{MOCK_ACCOUNT_EMAIL}</strong></div>
      </header>
      <main className="page-layout">
        <ProgressSidebar status={status} correctionCount={correctionCount} step={currentStep} />
        <section className="main-column">
          <div className="intro-card">
            <div className="title-icon" aria-hidden="true">✓</div>
            <div><span className="eyebrow">Form 1 · Seller verification</span><h1>Seller verification application</h1><p>Complete the four sections below. We will show you the information and evidence required for the application path you select.</p><div className="intro-meta"><span><b>◈</b> Private review</span><span><b>◷</b> About 4 minutes</span><span><b>✓</b> Store application is a later stage</span></div></div>
          </div>

          <nav className="journey-strip" aria-label="Seller verification sections">
            {journeySteps.map((journey, index) => <button key={journey.id} type="button" disabled={index > currentStep + 1 || !editing} className={`journey-step ${activeSection === journey.id ? 'active' : ''}`} onClick={() => jumpToSection(journey.id, index)}><span className="journey-number">{index + 1}</span><strong>{journey.label}</strong>{index < journeySteps.length - 1 && <i aria-hidden="true" />}</button>)}
          </nav>

          {status !== 'not_submitted' && <div className={`status-banner ${status}`} role="status" aria-live="polite"><div className="status-symbol" aria-hidden="true">{status === 'approved' ? '✓' : status === 'closed' ? '×' : 'i'}</div><div><strong>{status === 'submitting' ? 'Submitting your verification' : status === 'awaiting_review' ? 'Submitted · awaiting review' : status === 'correction_requested' ? 'Correction requested' : status === 'approved' ? 'Verification approved · simulated' : 'Application closed · simulated'}</strong><p>{message}</p>{correctionReason && <p className="reason"><strong>Correction reason:</strong> {correctionReason}</p>}{record?.reviewerNote && <p className="reason"><strong>Reviewer note:</strong> {record.reviewerNote}</p>}{closureReason && <p className="reason"><strong>Closure reason:</strong> {closureReason}</p>}</div></div>}

          <form className="form-card" onSubmit={handleSubmit} noValidate>
            {Object.keys(errors).length > 0 && <div id="error-summary" className="error-summary" role="alert" tabIndex={-1}><strong>There are {Object.keys(errors).length} items to review.</strong><p>Correct the highlighted fields and try again. Evidence must meet the published requirements for the selected path.</p></div>}

            <fieldset disabled={!editing}>
              <legend className="sr-only">Applicant path</legend>
              {currentStep === 0 && <div id="application-type" className="path-grid section-anchor" role="radiogroup" aria-label="Choose an applicant path">
                <button type="button" role="radio" aria-checked={path === 'student'} className={`path-card ${path === 'student' ? 'selected' : ''}`} onClick={() => resetForPath('student')}><span className="card-icon"><ApplicantIcon kind="student" /></span><span><strong>I am an ESUT student</strong><small>For a currently enrolled student who would like to sell on ESUT Marketplace.</small></span></button>
                <button type="button" role="radio" aria-checked={path === 'business'} className={`path-card ${path === 'business' ? 'selected' : ''}`} onClick={() => resetForPath('business')}><span className="card-icon"><ApplicantIcon kind="business" /></span><span><strong>I represent a business or sell independently</strong><small>For a registered business, independent vendor, or authorised representative connected to ESUT.</small></span></button>
              </div>}
            </fieldset>

            {currentStep === 0 && path === 'business' && <section className="subsection"><SectionTitle eyebrow="Business or vendor path" title="What best describes your application?" /><div className="business-options" role="radiogroup" aria-label="Choose business or vendor type">{businessOptions.map((option) => <button key={option.value} type="button" role="radio" aria-checked={businessType === option.value} className={`business-option ${businessType === option.value ? 'selected' : ''}`} disabled={disabled} onClick={() => { setBusinessType(option.value); setFields({ ...initialFields }); setFiles({}); setDeclarations({ accuracy: false, verification: false, ownership: false, representative: false }); setErrors({}); }}><strong>{option.title}</strong><small>{option.description}</small></button>)}</div></section>}

            {currentStep === 1 && <section id="your-details" className="subsection section-anchor"><SectionTitle eyebrow="Your details" title="Tell us about you" /><div className="field-grid"><Field label="Full legal name" name="fullName" value={fields.fullName} onChange={updateField} error={errors.fullName} disabled={disabled} placeholder="Enter your name as it appears on your evidence" /><Field label="Account email" name="email" value={MOCK_ACCOUNT_EMAIL} onChange={() => undefined} disabled error={undefined} required={false} /><Field label="Contact number" name="contactNumber" value={fields.contactNumber} onChange={updateField} error={errors.contactNumber} disabled={disabled} placeholder="Only if needed for verification communication" required={false} />
              {path === 'student' && <><Field label="ESUT matriculation/registration number" name="registrationNumber" value={fields.registrationNumber} onChange={updateField} error={errors.registrationNumber} disabled={disabled} /><Field label="Faculty" name="faculty" value={fields.faculty} onChange={updateField} error={errors.faculty} disabled={disabled} /><Field label="Department" name="department" value={fields.department} onChange={updateField} error={errors.department} disabled={disabled} /><div className="field"><label htmlFor="academicLevel">Current academic level<span className="required-mark">Required</span></label><select id="academicLevel" value={fields.academicLevel} disabled={disabled} aria-invalid={Boolean(errors.academicLevel)} onChange={(event) => updateField('academicLevel', event.target.value)}><option value="">Choose your level</option><option>100 level</option><option>200 level</option><option>300 level</option><option>400 level</option><option>500 level</option><option>Postgraduate</option></select>{errors.academicLevel && <span className="field-error" role="alert">{errors.academicLevel}</span>}</div><Field label="Year of enrollment" name="enrollmentYear" value={fields.enrollmentYear} onChange={updateField} disabled={disabled} placeholder="e.g. 2024" required={false} type="number" /><Field label="Expected graduation year" name="graduationYear" value={fields.graduationYear} onChange={updateField} disabled={disabled} placeholder="e.g. 2028" required={false} type="number" /></>}
              {path === 'business' && businessType === 'registered-owner' && <><Field label="Registered business name" name="businessName" value={fields.businessName} onChange={updateField} error={errors.businessName} disabled={disabled} /><Field label="CAC registration number" name="cacNumber" value={fields.cacNumber} onChange={updateField} error={errors.cacNumber} disabled={disabled} /><Textarea label="Business description or nature of trading activity" name="businessDescription" value={fields.businessDescription} onChange={updateField} error={errors.businessDescription} disabled={disabled} placeholder="Describe what the business sells or does." /><Textarea label="How do you establish your ownership claim?" name="ownershipClaim" value={fields.ownershipClaim} onChange={updateField} error={errors.ownershipClaim} disabled={disabled} placeholder="Explain the ownership connection an administrator should review." /><Textarea label="How are you connected to the ESUT community?" name="communityConnection" value={fields.communityConnection} onChange={updateField} error={errors.communityConnection} disabled={disabled} placeholder="Share the relevant connection and context." /></>}
              {path === 'business' && businessType === 'unregistered-vendor' && <><Field label="Vendor or trading name" name="vendorName" value={fields.vendorName} onChange={updateField} error={errors.vendorName} disabled={disabled} required={false} placeholder="Optional if you sell under your personal name" /><Textarea label="What products or services do you offer?" name="productsServices" value={fields.productsServices} onChange={updateField} error={errors.productsServices} disabled={disabled} /><Textarea label="Describe your genuine selling activity" name="sellingActivity" value={fields.sellingActivity} onChange={updateField} error={errors.sellingActivity} disabled={disabled} placeholder="Include useful context such as where or how you sell." /><Textarea label="How are you connected to the ESUT community?" name="communityConnection" value={fields.communityConnection} onChange={updateField} error={errors.communityConnection} disabled={disabled} placeholder="Share the relevant connection and context." /></>}
              {path === 'business' && businessType === 'authorized-representative' && <><Field label="Registered business name" name="businessName" value={fields.businessName} onChange={updateField} error={errors.businessName} disabled={disabled} /><Field label="CAC registration number" name="cacNumber" value={fields.cacNumber} onChange={updateField} error={errors.cacNumber} disabled={disabled} /><Field label="Your role in the business" name="representativeRole" value={fields.representativeRole} onChange={updateField} error={errors.representativeRole} disabled={disabled} placeholder="e.g. Operations manager" /><Textarea label="How are you connected to the ESUT community?" name="communityConnection" value={fields.communityConnection} onChange={updateField} error={errors.communityConnection} disabled={disabled} placeholder="Share the relevant connection and context." /></>}
            </div></section>}

            {currentStep === 2 && <section id="evidence" className="subsection section-anchor"><SectionTitle eyebrow="Documents for review" title="Add the documents that support your application"><p className="section-intro">Please upload a clear PDF, JPG, or PNG file for each item below. Your documents are used only to review this application. You may replace a document before submitting.</p></SectionTitle><div className="evidence-grid">
              {path === 'student' && <><EvidenceUpload label="Current academic-session course registration form" description="Required. This must relate to the current academic session." file={files.courseRegistration} error={errors.courseRegistration} onChange={(file) => updateFile('courseRegistration', file)} testId="course-registration" /><div className="supporting-evidence"><EvidenceUpload label="ESUT student ID card" description="Choose this or a JAMB admission letter as your supporting student document." required={false} file={files.studentId} error={errors.studentId || errors.supportingDocument} onChange={(file) => updateFile('studentId', file)} testId="student-id" /><EvidenceUpload label="JAMB admission letter" description="Choose this or an ESUT student ID card as your supporting student document." required={false} file={files.jambLetter} error={errors.jambLetter} onChange={(file) => updateFile('jambLetter', file)} testId="jamb-letter" /></div></>}
              {path === 'business' && businessType === 'registered-owner' && <><EvidenceUpload label="CAC registration evidence" description="Upload the document that confirms your registered business details." file={files.cacRegistration} error={errors.cacRegistration} onChange={(file) => updateFile('cacRegistration', file)} testId="cac-registration" /><EvidenceUpload label="Proof of ownership" description="Upload a document that supports your claim as the business owner." file={files.ownershipClaim} error={errors.ownershipClaim} onChange={(file) => updateFile('ownershipClaim', file)} testId="ownership-claim" /><EvidenceUpload label="Your ESUT connection" description="Show how you or your business is connected to the ESUT community." file={files.communityConnection} error={errors.communityConnection} onChange={(file) => updateFile('communityConnection', file)} testId="community-connection" /></>}
              {path === 'business' && businessType === 'unregistered-vendor' && <><EvidenceUpload label="Proof of identity" description="Upload a document that helps us confirm who you are." file={files.identity} error={errors.identity} onChange={(file) => updateFile('identity', file)} testId="identity-evidence" /><EvidenceUpload label="Proof that you sell" description="This may be a dated product photograph or current catalogue. These are examples, not a complete list." file={files.sellingActivity} error={errors.sellingActivity} onChange={(file) => updateFile('sellingActivity', file)} testId="selling-activity" /><EvidenceUpload label="Your ESUT connection" description="Show the connection that makes you eligible to apply to ESUT Marketplace." file={files.communityConnection} error={errors.communityConnection} onChange={(file) => updateFile('communityConnection', file)} testId="community-connection" /></>}
              {path === 'business' && businessType === 'authorized-representative' && <><EvidenceUpload label="Business registration evidence" description="Upload the document that confirms the business is registered." file={files.cacRegistration} error={errors.cacRegistration} onChange={(file) => updateFile('cacRegistration', file)} testId="cac-registration" /><EvidenceUpload label="Your ESUT connection" description="Show the relevant connection between the business and the ESUT community." file={files.communityConnection} error={errors.communityConnection} onChange={(file) => updateFile('communityConnection', file)} testId="community-connection" /><div className="authorization-wrap"><div className="field"><label htmlFor="authorizationType">How will you show your authority?<span className="required-mark">Required</span></label><select id="authorizationType" value={fields.authorizationType} disabled={disabled} onChange={(event) => updateField('authorizationType', event.target.value)}><option value="signed-letter">Signed Business Authorization Letter (preferred)</option><option value="appointment-letter">Appointment or Employment Letter supporting authority</option><option value="other-credible">Other Credible Authorization Document</option></select></div><p className="helper-text">If you choose another document, it must carry either a valid business stamp or the signature of the person or authority giving permission. Both are not required.</p><EvidenceUpload label="Authority document" description="Upload the document that shows you are allowed to represent the business." file={files.authorization} error={errors.authorization} onChange={(file) => updateFile('authorization', file)} testId="authorization" /></div></>}
            </div></section>}

            {currentStep === 3 && <section id="declarations" className="declarations section-anchor">
              <div className="privacy-panel">
                <span className="privacy-panel-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>Privacy information pending final policy review.</strong>
                  <p>This privacy notice is separate from the declarations. The Privacy Policy link will be provided after policy review.</p>
                  {PRIVACY_POLICY_URL ? <a href={PRIVACY_POLICY_URL}>Privacy Policy</a> : <span className="pending-policy">Privacy Policy link pending final policy review.</span>}
                  <p className="helper-text">No separate privacy consent is requested in this prototype. The appropriate lawful basis and whether consent is required remain unresolved.</p>
                </div>
              </div>
              <SectionTitle eyebrow="Applicant declaration" title="Review, confirm, and submit"><p className="section-intro">Proposed wording — pending final policy review. Acknowledge every statement that applies to your application.</p></SectionTitle>
              {activeDeclarations.map((declaration) => {
                const errorKey = `${declaration.key}Declaration`
                return <label className={`declaration ${errors[errorKey] ? 'has-error' : ''}`} key={declaration.key}>
                  <input type="checkbox" checked={declarations[declaration.key]} disabled={disabled} aria-describedby={errors[errorKey] ? errorKey : undefined} onChange={(event) => updateDeclaration(declaration.key, event.target.checked)} />
                  <span><strong>{declaration.label}</strong><span>{declaration.text}</span>{errors[errorKey] && <span className="field-error" id={errorKey} role="alert">{errors[errorKey]}</span>}</span>
                </label>
              })}
            </section>}

            <div className="form-footer"><div><strong>{currentStep === 3 ? 'Before you send this application' : `Section ${currentStep + 1} of ${journeySteps.length}`}</strong><p>{currentStep === 3 ? 'An ESUT Marketplace reviewer will assess the information and documents you provide. Sending this form does not guarantee approval.' : 'You can go back and make changes before the application is sent.'}</p></div><div className="footer-actions">{currentStep > 0 && <button className="back-button" type="button" onClick={() => { const previous = currentStep - 1; setCurrentStep(previous); setActiveSection(journeySteps[previous].id); setErrors({}); scrollToTop() }}>Back</button>}<button className="submit-button" type="submit" disabled={disabled}>{status === 'submitting' ? 'Sending application…' : currentStep < journeySteps.length - 1 ? 'Continue to next section' : status === 'correction_requested' ? 'Send corrected application' : 'Send application for review'}</button></div></div>
          </form>

          {status === 'awaiting_review' && record && <div className="workflow-actions"><div><strong>Review demonstration</strong><p>These demonstration controls show how a review decision may be recorded. They do not change marketplace access.</p></div>{correctionCount === 0 ? <button type="button" className="secondary-button" onClick={requestCorrection}>Show a correction request</button> : <button type="button" className="secondary-button" onClick={closeApplication}>Show application closure</button>}</div>}
          {history.length > 0 && <details className="history-card"><summary>Application updates ({history.length})</summary><ol>{history.map((item, index) => <li key={`${item.id}-${index}`}><strong>{item.id}</strong><span>{item.status.replace('_', ' ')}</span><time>{new Date(item.submittedAt).toLocaleString()}</time></li>)}</ol></details>}
        </section>
      </main>
    </div>
  )
}
