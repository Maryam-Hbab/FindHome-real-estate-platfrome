"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import PropertyValuationTool from "@/components/property-valuation-tool"

export default function PropertyValuationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Valuation Tool</h1>
        <p className="text-gray-600">
          Get an accurate estimate of your property's market value based on comparable sales and local market data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PropertyValuationTool />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="bg-emerald-100 rounded-full p-2 mr-3">
                  <span className="font-bold text-emerald-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Enter Property Details</h3>
                  <p className="text-sm text-gray-600">
                    Provide information about your property including location, size, and features.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-emerald-100 rounded-full p-2 mr-3">
                  <span className="font-bold text-emerald-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium">AI Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Our AI analyzes comparable properties and current market trends.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-emerald-100 rounded-full p-2 mr-3">
                  <span className="font-bold text-emerald-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Get Your Estimate</h3>
                  <p className="text-sm text-gray-600">
                    Receive a detailed valuation report with estimated price range and confidence score.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Use Our Valuation Tool?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Accurate Estimates</h4>
                  <p className="text-sm text-gray-600">
                    Our algorithm is trained on millions of property transactions for high accuracy.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Real-Time Data</h4>
                  <p className="text-sm text-gray-600">
                    Uses the latest market data and trends for up-to-date valuations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Detailed Reports</h4>
                  <p className="text-sm text-gray-600">
                    Get comprehensive insights including comparable properties and market analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Professional Help?</CardTitle>
              <CardDescription>Connect with a local real estate expert for a personalized valuation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Find an Agent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
