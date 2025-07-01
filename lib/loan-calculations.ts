import { addMonths } from "date-fns"

// Helper function to calculate monthly payment (PMT formula)
export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) {
    return principal / termMonths
  }
  const monthlyRate = annualRate / 12
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1)
  return monthlyPayment
}

// Function to generate an amortization schedule
export function getAmortizationSchedule(
  principal: number,
  annualRate: number, // as decimal, e.g., 0.05
  termMonths: number,
  startDate: Date,
) {
  const monthlyRate = annualRate / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths)

  let balance = principal
  const schedule = []
  let currentDueDate = new Date(startDate) // Start date is the first payment date

  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance -= principalPayment

    currentDueDate = addMonths(currentDueDate, 1) // Next due date

    schedule.push({
      paymentNumber: i,
      paymentDate: new Date(currentDueDate), // This is the due date for this payment
      monthlyPayment: monthlyPayment,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      remainingBalance: Math.max(0, balance), // Ensure non-negative
    })
  }
  return schedule
}
