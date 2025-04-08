import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Search, Users, MapPin, DollarSign, FileText, Bell, Calendar } from "lucide-react"
import FeaturedProperties from "@/components/featured-properties"
import HeroSearch from "@/components/hero-search"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">Find Your Perfect Home</h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Discover thousands of properties for sale and rent across the country with our comprehensive real estate
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  List Your Property
                </Button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need in One Platform</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive real estate platform offers all the tools and features you need to find, buy, sell, or
              rent properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8" />,
                title: "Property Search",
                description: "Find properties that match your criteria with our advanced search tools.",
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "Interactive Maps",
                description: "Explore neighborhoods and properties with our interactive map interface.",
              },
              {
                icon: <DollarSign className="h-8 w-8" />,
                title: "Financial Tools",
                description: "Calculate mortgage payments and understand the financial aspects of buying.",
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Schedule Tours",
                description: "Book property viewings directly through our platform.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Connect with Agents",
                description: "Message and work with top real estate agents in your area.",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Document Management",
                description: "Securely store and manage all your real estate documents.",
              },
              {
                icon: <Bell className="h-8 w-8" />,
                title: "Notifications",
                description: "Get alerts about new properties that match your criteria.",
              },
              {
                icon: <Home className="h-8 w-8" />,
                title: "Property Analytics",
                description: "Access detailed analytics about properties and market trends.",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-emerald-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <Link href="/properties" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
              View all properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Ready to Find Your Dream Home?</h2>
              <p className="text-xl text-emerald-100">
                Join thousands of satisfied users who found their perfect property through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                  Sign Up Now
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">10,000+</h3>
                <p>Properties Listed</p>
              </div>
              <div className="bg-emerald-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">5,000+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="bg-emerald-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">1,000+</h3>
                <p>Expert Agents</p>
              </div>
              <div className="bg-emerald-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">100+</h3>
                <p>Cities Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

