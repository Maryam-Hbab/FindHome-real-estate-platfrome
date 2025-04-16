"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface AuditLog {
  _id: string
  action: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
  targetType: string
  targetId: string
  details: any
  createdAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function AuditLogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: "",
    targetType: "",
    userId: "",
  })

  // Format date function to avoid TypeScript issues with date-fns
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString("en-US", { month: "short" })
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`
  }

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      fetchAuditLogs()
    }
  }, [user, loading, router, pagination.page, filters])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)

      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append("page", pagination.page.toString())
      queryParams.append("limit", pagination.limit.toString())

      if (filters.action) {
        queryParams.append("action", filters.action)
      }

      if (filters.targetType) {
        queryParams.append("targetType", filters.targetType)
      }

      if (filters.userId) {
        queryParams.append("userId", filters.userId)
      }

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs")
      }

      const data = await response.json()
      setAuditLogs(data.auditLogs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page when filters change
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const getActionLabel = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getTargetTypeLabel = (targetType: string) => {
    return targetType.charAt(0).toUpperCase() + targetType.slice(1)
  }

  // Redirect if not an admin
  if (!loading && user && user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button asChild>
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="property_created">Property Created</SelectItem>
                  <SelectItem value="property_updated">Property Updated</SelectItem>
                  <SelectItem value="property_deleted">Property Deleted</SelectItem>
                  <SelectItem value="property_moderation_updated">Property Moderation Updated</SelectItem>
                  <SelectItem value="property_reported">Property Reported</SelectItem>
                  <SelectItem value="appeal_created">Appeal Created</SelectItem>
                  <SelectItem value="appeal_updated">Appeal Updated</SelectItem>
                  <SelectItem value="user_created">User Created</SelectItem>
                  <SelectItem value="user_updated">User Updated</SelectItem>
                  <SelectItem value="user_deleted">User Deleted</SelectItem>
                  <SelectItem value="user_role_updated">User Role Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Target Type</label>
              <Select value={filters.targetType} onValueChange={(value) => handleFilterChange("targetType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="appeal">Appeal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">User ID</label>
              <Input
                placeholder="Enter user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Records</CardTitle>
          <CardDescription>
            Showing {auditLogs.length} of {pagination.total} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No audit logs found matching the current filters.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="font-medium">{formatDateTime(log.createdAt)}</TableCell>
                        <TableCell>{getActionLabel(log.action)}</TableCell>
                        <TableCell>
                          <div>
                            <div>{`${log.user.firstName} ${log.user.lastName}`}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                            <div className="text-xs text-gray-500">{log.user.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{getTargetTypeLabel(log.targetType)}</div>
                            <div className="text-xs text-gray-500">{log.targetId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs whitespace-pre-wrap max-w-xs overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    {[...Array(pagination.pages)].map((_, i) => {
                      const pageNumber = i + 1
                      // Show first, last, current, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === pagination.pages ||
                        (pageNumber >= pagination.page - 2 && pageNumber <= pagination.page + 2)
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === pagination.page ? "default" : "outline"}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        )
                      } else if (
                        (pageNumber === 2 && pagination.page > 4) ||
                        (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 3)
                      ) {
                        return (
                          <Button key={pageNumber} variant="outline" disabled>
                            ...
                          </Button>
                        )
                      }
                      return null
                    })}
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
