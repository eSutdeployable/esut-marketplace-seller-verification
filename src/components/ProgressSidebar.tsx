import type { VerificationStatus } from '../types'

type Props = { status: VerificationStatus; correctionCount: number; step: number }

export function ProgressSidebar({ status, correctionCount, step }: Props) {
  const complete = status === 'approved'
  const submitted = status !== 'not_submitted'
  const label = status === 'awaiting_review' ? 'AWAITING REVIEW' : status === 'correction_requested' ? 'CORRECTION REQUESTED' : status === 'approved' ? 'APPROVED' : status === 'closed' ? 'CLOSED' : status === 'submitting' ? 'SUBMITTING' : 'NOT STARTED'
  const steps = ['Application type', 'Your details', 'Evidence', 'Declarations']
  const activeStep = complete ? 4 : Math.max(1, Math.min(4, step + 1))
  return (
    <aside className="progress-card" aria-label="Your progress">
      <div className="progress-visual">
        <div className="storefront-preview" aria-label="ESUT Marketplace seller centre">
          <span className="storefront-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M4 10h16l-1.3-5H5.3L4 10Z" /><path d="M5 10v9h14v-9M9 19v-5h6v5M3 10h18" /><path d="M6 5v2M10 5v2M14 5v2M18 5v2" /></svg></span>
          <span><b>ESUT Marketplace</b><small>Seller centre</small></span>
        </div>
        <span>FORM 1</span><strong>Seller verification</strong>
        <p className="storefront-caption">The first step towards opening your marketplace store.</p>
      </div>
      <div className="progress-heading">
        <div>
          <span className="eyebrow">Seller journey</span>
          <strong>{complete ? '4 of 4 steps complete' : `${activeStep - 1} of 4 steps complete`}</strong>
        </div>
        <span className="progress-icon" aria-hidden="true">✓</span>
      </div>
      <div className="progress-track" aria-hidden="true"><span style={{ width: `${complete ? 100 : Math.max(9, (activeStep - 1) * 25)}%` }} /></div>
      <ol className="steps">
        {steps.map((step, index) => {
          const number = index + 1
          const isDone = complete || number < activeStep
          const isActive = number === activeStep
          return <li key={step} className={`step ${isDone ? 'done' : isActive ? 'active' : 'future'}`}>
            <span className="step-number" aria-hidden="true">{isDone ? '✓' : number}</span>
            <div><strong>{step}</strong>{isActive && number === 1 && <span className={`status-pill ${submitted ? 'pending' : ''}`}>{label}</span>}<p>{number === 1 ? 'Choose the seller path that fits you.' : number === 2 ? 'Tell us who you are and how you sell.' : number === 3 ? 'Provide clear evidence for review.' : complete ? 'Your seller verification is approved.' : correctionCount > 0 ? 'One correction opportunity is available.' : 'Confirm declarations and submit.'}</p></div>
          </li>
        })}
      </ol>
      <div className="progress-privacy"><span className="privacy-icon" aria-hidden="true">✦</span><div><strong>Private by design</strong><p>Your verification evidence stays separate from your future public store.</p></div></div>
      <p className="side-note">This form is for seller verification. Completing it does not give access to seller tools or open a store.</p>
    </aside>
  )
}
