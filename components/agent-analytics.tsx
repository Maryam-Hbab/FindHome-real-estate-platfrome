"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MessageSquare, Calendar, TrendingUp } from "lucide-react"

interface AgentAnalyticsProps {
  agentId: string
}

interface AnalyticsData {
  propertyViews: number
  totalInquiries: number
  appointmentsScheduled: number
  averageRating: number
}

const loadingData: AnalyticsData = {
  propertyViews: 0,
  totalInquiries: 0,
  appointmentsScheduled: 0,
  averageRating: 0,
}

export function AgentAnalytics({ agentId }: AgentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(loadingData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch analytics data from API
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        // Replace with your actual API endpoint
        // const response = await fetch(`/api/agents/${agentId}/analytics`);
        // const data = await response.json();
        // setAnalytics(data);

        // Simulate API delay
        setTimeout(() => {
          setAnalytics({
            propertyViews: 1234,
            totalInquiries: 56,
            appointmentsScheduled: 23,
            averageRating: 4.8,
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [agentId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Performance</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnalyticsItem
          label="Property Views"
          value={analytics.propertyViews}
          icon={<Eye className="h-4 w-4 text-sky-500" />}
          loading={isLoading}
        />
        <AnalyticsItem
          label="Total Inquiries"
          value={analytics.totalInquiries}
          icon={<MessageSquare className="h-4 w-4 text-orange-500" />}
          loading={isLoading}
        />
        <AnalyticsItem
          label="Appointments"
          value={analytics.appointmentsScheduled}
          icon={<Calendar className="h-4 w-4 text-blue-500" />}
          loading={isLoading}
        />
        <AnalyticsItem
          label="Avg. Rating"
          value={analytics.averageRating}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  )
}

interface AnalyticsItemProps {
  label: string
  value: number | string
  icon: React.ReactNode
  loading: boolean
}

function AnalyticsItem({ label, value, icon, loading }: AnalyticsItemProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center">
        {icon}
        <span className="ml-2 font-medium">{label}</span>
      </div>
      {loading ? <Skeleton className="h-5 w-20" /> : <div className="text-2xl font-bold tracking-tight">{value}</div>}
    </div>
  )
}
