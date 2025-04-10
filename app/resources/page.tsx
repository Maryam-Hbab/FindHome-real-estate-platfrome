"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  BookOpen,
  Calculator,
  FileText,
  HelpCircle,
  TrendingUp,
  Home,
  DollarSign,
  Key,
  Briefcase,
  FileCheck,
  Clock,
} from "lucide-react"

// Mock resource articles
const articles = [
  {
    id: "first-time-buyer-guide",
    title: "Complete Guide for First-Time Home Buyers",
    category: "buying",
    description:
      "Everything you need to know about purchasing your first home, from saving for a down payment to closing the deal.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "15 min read",
    date: "May 15, 2023",
  },
  {
    id: "mortgage-basics",
    title: "Understanding Mortgage Basics",
    category: "financing",
    description:
      "Learn about different types of mortgages, interest rates, terms, and how to qualify for the best loan.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "12 min read",
    date: "June 3, 2023",
  },
  {
    id: "home-selling-tips",
    title: "10 Tips to Maximize Your Home's Selling Price",
    category: "selling",
    description: "Strategic improvements and staging tips that can help you get top dollar when selling your property.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "10 min read",
    date: "April 22, 2023",
  },
  {
    id: "investment-strategies",
    title: "Real Estate Investment Strategies for Beginners",
    category: "investing",
    description:
      "Different approaches to real estate investing, from rental properties to REITs and everything in between.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "18 min read",
    date: "July 8, 2023",
  },
  {
    id: "closing-process",
    title: "The Closing Process Explained",
    category: "buying",
    description:
      "A step-by-step guide to what happens during closing, what documents you'll need, and potential pitfalls to avoid.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "8 min read",
    date: "May 30, 2023",
  },
  {
    id: "home-inspection",
    title: "What to Look for in a Home Inspection",
    category: "buying",
    description: "Key areas that every buyer should pay attention to during the home inspection process.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "11 min read",
    date: "June 15, 2023",
  },
  {
    id: "rental-property-management",
    title: "Effective Rental Property Management",
    category: "investing",
    description:
      "Best practices for managing rental properties, finding good tenants, and maximizing your return on investment.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "14 min read",
    date: "July 22, 2023",
  },
  {
    id: "market-trends-2023",
    title: "Real Estate Market Trends for 2023",
    category: "market",
    description:
      "Analysis of current market conditions, predictions for the future, and how these trends might affect buyers and sellers.",
    image: "/placeholder.svg?height=200&width=400",
    readTime: "16 min read",
    date: "August 5, 2023",
  },
]

// Tools data
const tools = [
  {
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payments based on home price, down payment, interest rate, and loan term.",
    icon: <Calculator className="h-8 w-8 text-emerald-600" />,
    link: "/resources/mortgage-calculator",
  },
  {
    title: "Affordability Calculator",
    description: "Determine how much house you can afford based on your income, expenses, and financial situation.",
    icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
    link: "/resources/affordability-calculator",
  },
  {
    title: "Rent vs. Buy Calculator",
    description: "Compare the financial benefits of renting versus buying a home over different time periods.",
    icon: <Home className="h-8 w-8 text-emerald-600" />,
    link: "/resources/rent-vs-buy-calculator",
  },
  {
    title: "Closing Cost Estimator",
    description: "Get an estimate of the closing costs you'll need to pay when purchasing a home in your area.",
    icon: <FileCheck className="h-8 w-8 text-emerald-600" />,
    link: "/resources/closing-cost-estimator",
  },
]

// FAQ data
const faqs = [
  {
    question: "How much do I need for a down payment?",
    answer:
      "While 20% is often cited as the standard down payment, many loan programs allow for much lower down payments. FHA loans require as little as 3.5%, and some conventional loans start at 3%. VA loans and USDA loans may offer zero down payment options for those who qualify.",
  },
  {
    question: "What's the difference between pre-qualification and pre-approval?",
    answer:
      "Pre-qualification is an informal estimate of how much you might be able to borrow based on self-reported information. Pre-approval is a more formal process where a lender verifies your financial information and credit, providing a specific loan amount you're approved for.",
  },
  {
    question: "How long does the home buying process take?",
    answer:
      "The home buying process typically takes 30-60 days from offer acceptance to closing, but it can vary based on market conditions, financing requirements, and other factors. The search process itself can take anywhere from a few weeks to several months.",
  },
  {
    question: "What credit score do I need to buy a house?",
    answer:
      "Credit score requirements vary by loan type. Conventional loans typically require a minimum score of 620, while FHA loans may accept scores as low as 580. VA and USDA loans have flexible credit requirements. However, higher scores generally result in better interest rates.",
  },
  {
    question: "What are closing costs and who pays them?",
    answer:
      "Closing costs are fees associated with finalizing a real estate transaction, typically ranging from 2-5% of the loan amount. They include lender fees, title insurance, appraisals, and more. While buyers traditionally pay most closing costs, this can be negotiated with the seller.",
  },
]

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter articles based on search and category
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Real Estate Resources</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Helpful guides, tools, and information to help you navigate the real estate market with confidence.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for guides, articles, and resources..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Buyer's Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Everything you need to know about finding and purchasing your perfect home.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
              <Link href="/resources/buyers-guide">Read Guide</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" />
              Seller's Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Learn how to prepare your home for sale and maximize your property's value.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100">
              <Link href="/resources/sellers-guide">Read Guide</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-6 w-6 mr-2 text-purple-600" />
              Investor's Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Strategies and insights for building wealth through real estate investments.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
              <Link href="/resources/investors-guide">Read Guide</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Articles Section */}
      <div className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Articles & Guides</h2>
          <Tabs defaultValue="all" className="mt-4 md:mt-0" onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="buying">Buying</TabsTrigger>
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="financing">Financing</TabsTrigger>
              <TabsTrigger value="investing">Investing</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{article.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/resources/articles/${article.id}`}>Read Article</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild variant="outline" className="px-8">
            <Link href="/resources/articles">View All Articles</Link>
          </Button>
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Helpful Tools & Calculators</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Use these interactive tools to help with your real estate decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="mb-2">{tool.icon}</div>
                <CardTitle>{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={tool.link}>Use Calculator</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about buying, selling, and investing in real estate.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 flex items-start">
                <HelpCircle className="h-6 w-6 text-emerald-600 mr-2 flex-shrink-0 mt-1" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-gray-600 pl-8">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" className="px-8">
            <Link href="/resources/faq">View All FAQs</Link>
          </Button>
        </div>
      </div>

      {/* Market Reports Section */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Market Reports & Trends</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest real estate market data and analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-emerald-600" />
                Market Trends Report
              </CardTitle>
              <CardDescription>Q3 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive analysis of current market conditions, price trends, and forecasts.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/market-report-q3-2023">Download Report</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-6 w-6 mr-2 text-emerald-600" />
                Housing Affordability Index
              </CardTitle>
              <CardDescription>August 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Analysis of housing affordability across different regions and income levels.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/affordability-index-august-2023">View Report</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-6 w-6 mr-2 text-emerald-600" />
                First-Time Buyer Report
              </CardTitle>
              <CardDescription>July 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Special report on market conditions and opportunities for first-time homebuyers.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources/first-time-buyer-report-2023">Read Report</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-100 rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
        <p className="text-xl mb-6 max-w-3xl mx-auto">
          Subscribe to our newsletter to receive the latest real estate resources, market updates, and expert advice.
        </p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <Input placeholder="Your email address" className="flex-grow" />
          <Button className="bg-emerald-600 hover:bg-emerald-700">Subscribe</Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  )
}
