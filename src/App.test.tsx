import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

async function continueStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Continue/ }))
}

async function completeStudentForm(user: ReturnType<typeof userEvent.setup>) {
  await continueStep(user)
  await user.type(screen.getByLabelText(/Full legal name/), 'Ada Student')
  await user.type(screen.getByLabelText(/ESUT matriculation\/registration number/), 'ESUT/24/001')
  await user.type(screen.getByLabelText(/^Faculty/), 'Engineering')
  await user.type(screen.getByLabelText(/^Department/), 'Computer Engineering')
  await user.selectOptions(screen.getByLabelText(/Current academic level/), '300 level')
  await continueStep(user)
  const file = new File(['private evidence'], 'registration.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByTestId('course-registration'), file)
  await user.upload(screen.getByTestId('student-id'), file)
  await continueStep(user)
  await user.click(screen.getByLabelText(/I confirm that the information/))
  await user.click(screen.getByLabelText(/I authorize ESUT Marketplace to verify/))
}

describe('Form 1 applicant paths', () => {
  it('starts with the application-type step and conditionally reveals business choices', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('radio', { name: /I am an ESUT student/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Full legal name/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /I represent a business or sell independently/i }))
    expect(screen.getByRole('radio', { name: /Registered business owner/i })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Independent individual vendor/i }))
    await continueStep(user)
    expect(screen.getByLabelText(/What products or services do you offer/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/CAC registration number/)).not.toBeInTheDocument()
  })

  it('resets hidden path data when switching applicant paths', async () => {
    const user = userEvent.setup()
    render(<App />)
    await continueStep(user)
    await user.type(screen.getByLabelText(/Full legal name/), 'Student Only')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('radio', { name: /I represent a business or sell independently/i }))
    await continueStep(user)
    expect(screen.getByLabelText(/Full legal name/)).toHaveValue('')
  })

  it('blocks an incomplete details step with an accessible error summary', async () => {
    const user = userEvent.setup()
    render(<App />)
    await continueStep(user)
    await continueStep(user)
    expect(screen.getByText(/items to review/)).toBeInTheDocument()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(1)
  })

  it('prevents duplicate mock submissions and does not persist evidence in browser storage', async () => {
    const user = userEvent.setup()
    render(<App />)
    await completeStudentForm(user)
    const submit = screen.getByRole('button', { name: /Send application for review/ })
    await user.dblClick(submit)
    await waitFor(() => expect(screen.getByText(/Submitted · awaiting review/i)).toBeInTheDocument())
    expect(screen.getByText(/Application updates \(1\)/i)).toBeInTheDocument()
    expect(window.localStorage.length).toBe(0)
  })

  it('preserves original, correction-request, corrected, and closure events', async () => {
    const user = userEvent.setup()
    render(<App />)
    await completeStudentForm(user)
    await user.click(screen.getByRole('button', { name: /Send application for review/ }))
    await waitFor(() => expect(screen.getByText(/Submitted · awaiting review/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Show a correction request/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Correction requested')
    await continueStep(user)
    await user.click(screen.getByRole('button', { name: /Send corrected application/i }))
    await waitFor(() => expect(screen.getByText(/Submitted · awaiting review/i)).toBeInTheDocument())
    expect(screen.getByText(/Application updates \(3\)/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Show application closure/i }))
    expect(screen.getByText(/Application closed · simulated/i)).toBeInTheDocument()
  })
})
