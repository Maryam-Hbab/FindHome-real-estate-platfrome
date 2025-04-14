"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DollarSign, Percent, Calendar, Download, Share } from "lucide-react"

interface MortgageCalculatorProps {
  propertyPrice?: number
  defaultDownPaymentPercent?: number
  defaultInterestRate?: number
  defaultLoanTerm?: number
}

export default function MortgageCalculator({
  propertyPrice = 350000,
  defaultDownPaymentPercent = 20,
  defaultInterestRate = 4.5,
  defaultLoanTerm = 30,
}: MortgageCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(defaultDownPaymentPercent)
  const [downPaymentAmount, setDownPaymentAmount] = useState(propertyPrice * (defaultDownPaymentPercent / 100))
  const [interestRate, setInterestRate] = useState(defaultInterestRate)
  const [loanTerm, setLoanTerm] = useState(defaultLoanTerm)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)

  // Calculate mortgage details
  useEffect(() => {
    // Calculate loan amount
    const loanAmount = price - downPaymentAmount

    // Calculate monthly interest rate
    const monthlyInterestRate = interestRate / 100 / 12

    // Calculate number of payments
    const numberOfPayments = loanTerm * 12

    // Calculate monthly payment
    if (monthlyInterestRate === 0) {
      // If interest rate is 0, simple division
      const payment = loanAmount / numberOfPayments
      setMonthlyPayment(payment)
      setTotalPayment(payment * numberOfPayments)
      setTotalInterest(0)
    } else {
      // Standard mortgage formula
      const payment =
        (loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

      setMonthlyPayment(payment)
      setTotalPayment(payment * numberOfPayments)
      setTotalInterest(payment * numberOfPayments - loanAmount)
    }
  }, [price, downPaymentAmount, interestRate, loanTerm])

  // Handle down payment percent change
  const handleDownPaymentPercentChange = (value: number[]) => {
    const percent = value[0]
    setDownPaymentPercent(percent)
    setDownPaymentAmount(price * (percent / 100))
  }

  // Handle down payment amount change
  const handleDownPaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number.parseFloat(e.target.value) || 0
    setDownPaymentAmount(amount)
    setDownPaymentPercent((amount / price) * 100)
  }

  // Handle price change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number.parseFloat(e.target.value) || 0
    setPrice(newPrice)
    // Maintain the same down payment percentage
    setDownPaymentAmount(newPrice * (downPaymentPercent / 100))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="number" value={price} onChange={handlePriceChange} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Down Payment</label>
                  <span className="text-sm text-gray-500">{downPaymentPercent.toFixed(0)}%</span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[downPaymentPercent]}
                  onValueChange={handleDownPaymentPercentChange}
                />
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={downPaymentAmount}
                    onChange={handleDownPaymentAmountChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Interest Rate</label>
                  <span className="text-sm text-gray-500">{interestRate}%</span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                />
                <div className="relative mt-2">
                  <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number.parseFloat(e.target.value) || 0)}
                    step={0.1}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Loan Term</label>
                  <span className="text-sm text-gray-500">{loanTerm} years</span>
                </div>
                <Slider min={5} max={30} step={5} value={[loanTerm]} onValueChange={(value) => setLoanTerm(value[0])} />
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number.parseInt(e.target.value) || 0)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium">${(price - downPaymentAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-bold text-lg">${monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Payment:</span>
                <span className="font-medium">${totalPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium">${totalInterest.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Principal & Interest</p>
                  <p className="text-xl font-bold">${monthlyPayment.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Property Tax</p>
                  <p className="text-xl font-bold">$350.00</p>
                  <p className="text-xs text-gray-500">Estimated</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Home Insurance</p>
                  <p className="text-xl font-bold">$125.00</p>
                  <p className="text-xs text-gray-500">Estimated</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Monthly Payment</span>
                  <span className="text-xl font-bold">${(monthlyPayment + 350 + 125).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Includes principal, interest, property tax, and home insurance
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Amortization Schedule</h4>
                <p className="text-sm text-gray-600">
                  Over the {loanTerm}-year loan term, you'll pay ${totalPayment.toFixed(2)} in total, with $
                  {totalInterest.toFixed(2)} going toward interest.
                </p>
                <div className="h-8 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${((price - downPaymentAmount) / totalPayment) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Principal: ${(price - downPaymentAmount).toFixed(2)}</span>
                  <span>Interest: ${totalInterest.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
