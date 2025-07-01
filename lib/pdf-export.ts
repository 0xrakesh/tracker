import { format } from "date-fns"
import type { Expense } from "./models/expense"
import type { BudgetStatus } from "./models/budget"

// Create a printable HTML document and convert to PDF
function createPrintableDocument(content: string, title: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please check your popup blocker.")
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #6366f1;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #6366f1;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .summary {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .summary h2 {
          margin-top: 0;
          color: #6366f1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #6366f1;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .status-over {
          color: #dc2626;
          font-weight: bold;
        }
        .status-ok {
          color: #16a34a;
          font-weight: bold;
        }
        .section {
          margin: 30px 0;
        }
        .section h3 {
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${content}
      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print/Save as PDF</button>
        <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Auto-focus the print window
  printWindow.focus()
}

export function exportExpensesToPDF(expenses: Expense[], startDate: Date, endDate: Date, username: string) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Category breakdown
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)

  const content = `
    <div class="header">
      <h1>Expense Report</h1>
      <p><strong>Generated for:</strong> ${username}</p>
      <p><strong>Period:</strong> ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}</p>
      <p><strong>Generated on:</strong> ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}</p>
    </div>

    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Total Expenses:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p><strong>Number of Transactions:</strong> ${expenses.length}</p>
      <p><strong>Average per Transaction:</strong> ₹${expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : "0.00"}</p>
    </div>

    <div class="section">
      <h3>Expense Details</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses
            .map(
              (expense) => `
            <tr>
              <td>${format(new Date(expense.date), "MMM dd, yyyy")}</td>
              <td>${expense.description}</td>
              <td>${expense.category}</td>
              <td class="amount">₹${expense.amount.toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    ${
      categoryData.length > 0
        ? `
    <div class="section">
      <h3>Category Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Amount</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${categoryData
            .map(
              ([category, amount]) => `
            <tr>
              <td>${category}</td>
              <td class="amount">₹${amount.toFixed(2)}</td>
              <td class="amount">${((amount / totalAmount) * 100).toFixed(1)}%</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }
  `

  createPrintableDocument(content, `Expenses-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`)
}

export function exportBudgetsToPDF(budgetStatus: BudgetStatus[], username: string) {
  const totalBudget = budgetStatus.reduce((sum, status) => sum + status.budget.amount, 0)
  const totalSpent = budgetStatus.reduce((sum, status) => sum + status.spent, 0)
  const overBudgetCount = budgetStatus.filter((status) => status.isOverBudget).length

  const content = `
    <div class="header">
      <h1>Budget Report</h1>
      <p><strong>Generated for:</strong> ${username}</p>
      <p><strong>Generated on:</strong> ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}</p>
    </div>

    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Total Budget:</strong> ₹${totalBudget.toFixed(2)}</p>
      <p><strong>Total Spent:</strong> ₹${totalSpent.toFixed(2)}</p>
      <p><strong>Overall Usage:</strong> ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "0"}%</p>
      <p><strong>Over Budget Categories:</strong> ${overBudgetCount}</p>
    </div>

    <div class="section">
      <h3>Budget Details</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Period</th>
            <th>Budget</th>
            <th>Spent</th>
            <th>Remaining</th>
            <th>Usage %</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${budgetStatus
            .map(
              (status) => `
            <tr>
              <td>${status.budget.category}</td>
              <td style="text-transform: capitalize;">${status.budget.period}</td>
              <td class="amount">₹${status.budget.amount.toFixed(2)}</td>
              <td class="amount">₹${status.spent.toFixed(2)}</td>
              <td class="amount">₹${Math.abs(status.remaining).toFixed(2)}</td>
              <td class="amount">${status.percentage.toFixed(1)}%</td>
              <td class="${status.isOverBudget ? "status-over" : "status-ok"}">
                ${status.isOverBudget ? "Over Budget" : "Within Budget"}
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `

  createPrintableDocument(content, `Budgets-${format(new Date(), "yyyy-MM-dd")}`)
}

export function exportStatisticsToPDF(stats: any, startDate: Date, endDate: Date, username: string) {
  const content = `
    <div class="header">
      <h1>Statistics Report</h1>
      <p><strong>Generated for:</strong> ${username}</p>
      <p><strong>Period:</strong> ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}</p>
      <p><strong>Generated on:</strong> ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}</p>
    </div>

    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Total Expenses:</strong> ₹${stats.total.toFixed(2)}</p>
      <p><strong>Number of Categories:</strong> ${stats.byCategory?.length || 0}</p>
      <p><strong>Number of Months:</strong> ${stats.byMonth?.length || 0}</p>
    </div>

    ${
      stats.byMonth && stats.byMonth.length > 0
        ? `
    <div class="section">
      <h3>Monthly Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Amount</th>
            <th>Percentage of Total</th>
          </tr>
        </thead>
        <tbody>
          ${stats.byMonth
            .map(
              (item: any) => `
            <tr>
              <td>${new Date(0, item.month - 1).toLocaleString("default", { month: "long" })} ${item.year}</td>
              <td class="amount">₹${item.total.toFixed(2)}</td>
              <td class="amount">${stats.total > 0 ? ((item.total / stats.total) * 100).toFixed(1) : "0"}%</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      stats.byCategory && stats.byCategory.length > 0
        ? `
    <div class="section">
      <h3>Category Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Percentage of Total</th>
          </tr>
        </thead>
        <tbody>
          ${stats.byCategory
            .map(
              (item: any) => `
            <tr>
              <td>${item.category}</td>
              <td class="amount">₹${item.total.toFixed(2)}</td>
              <td class="amount">${((item.total / stats.total) * 100).toFixed(1)}%</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }
  `

  createPrintableDocument(content, `Statistics-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`)
}
