import jsPDF from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import type { Expense } from "./models/expense"
import type { BudgetStatus } from "./models/budget"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export function exportExpensesToPDF(expenses: Expense[], startDate: Date, endDate: Date, username: string) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Expense Report", 20, 20)

  doc.setFontSize(12)
  doc.text(`Generated for: ${username}`, 20, 35)
  doc.text(`Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`, 20, 45)
  doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 55)

  // Summary
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  doc.setFontSize(14)
  doc.text(`Total Expenses: ₹${totalAmount.toFixed(2)}`, 20, 70)
  doc.text(`Number of Transactions: ${expenses.length}`, 20, 80)

  // Table data
  const tableData = expenses.map((expense) => [
    format(new Date(expense.date), "MMM dd, yyyy"),
    expense.description,
    expense.category,
    `₹${expense.amount.toFixed(2)}`,
  ])

  // Table
  doc.autoTable({
    head: [["Date", "Description", "Category", "Amount"]],
    body: tableData,
    startY: 90,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [99, 102, 241], // Primary color
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Category breakdown
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => [category, `₹${amount.toFixed(2)}`])

  if (categoryData.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 90
    doc.setFontSize(14)
    doc.text("Category Breakdown", 20, finalY + 20)

    doc.autoTable({
      head: [["Category", "Total Amount"]],
      body: categoryData,
      startY: finalY + 30,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
      },
    })
  }

  doc.save(`expenses-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.pdf`)
}

export function exportBudgetsToPDF(budgetStatus: BudgetStatus[], username: string) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Budget Report", 20, 20)

  doc.setFontSize(12)
  doc.text(`Generated for: ${username}`, 20, 35)
  doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 45)

  // Summary
  const totalBudget = budgetStatus.reduce((sum, status) => sum + status.budget.amount, 0)
  const totalSpent = budgetStatus.reduce((sum, status) => sum + status.spent, 0)
  const overBudgetCount = budgetStatus.filter((status) => status.isOverBudget).length

  doc.setFontSize(14)
  doc.text(`Total Budget: ₹${totalBudget.toFixed(2)}`, 20, 60)
  doc.text(`Total Spent: ₹${totalSpent.toFixed(2)}`, 20, 70)
  doc.text(`Over Budget Categories: ${overBudgetCount}`, 20, 80)

  // Table data
  const tableData = budgetStatus.map((status) => [
    status.budget.category,
    status.budget.period,
    `₹${status.budget.amount.toFixed(2)}`,
    `₹${status.spent.toFixed(2)}`,
    `₹${Math.abs(status.remaining).toFixed(2)}`,
    `${status.percentage.toFixed(1)}%`,
    status.isOverBudget ? "Over Budget" : "Within Budget",
  ])

  // Table
  doc.autoTable({
    head: [["Category", "Period", "Budget", "Spent", "Remaining", "Usage %", "Status"]],
    body: tableData,
    startY: 90,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      6: {
        cellWidth: 25,
        fontSize: 8,
      },
    },
  })

  doc.save(`budgets-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

export function exportStatisticsToPDF(stats: any, startDate: Date, endDate: Date, username: string) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text("Statistics Report", 20, 20)

  doc.setFontSize(12)
  doc.text(`Generated for: ${username}`, 20, 35)
  doc.text(`Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`, 20, 45)
  doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 20, 55)

  // Summary
  doc.setFontSize(16)
  doc.text(`Total Expenses: ₹${stats.total.toFixed(2)}`, 20, 75)

  let currentY = 90

  // Monthly breakdown
  if (stats.byMonth && stats.byMonth.length > 0) {
    doc.setFontSize(14)
    doc.text("Monthly Breakdown", 20, currentY)
    currentY += 10

    const monthlyData = stats.byMonth.map((item: any) => [
      `${new Date(0, item.month - 1).toLocaleString("default", { month: "long" })} ${item.year}`,
      `₹${item.total.toFixed(2)}`,
    ])

    doc.autoTable({
      head: [["Month", "Amount"]],
      body: monthlyData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 20
  }

  // Category breakdown
  if (stats.byCategory && stats.byCategory.length > 0) {
    doc.setFontSize(14)
    doc.text("Category Breakdown", 20, currentY)
    currentY += 10

    const categoryData = stats.byCategory.map((item: any) => [
      item.category,
      `₹${item.total.toFixed(2)}`,
      `${((item.total / stats.total) * 100).toFixed(1)}%`,
    ])

    doc.autoTable({
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })
  }

  doc.save(`statistics-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.pdf`)
}
