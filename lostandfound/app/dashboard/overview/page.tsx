"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, Clock, MapPin, Package, Search, ShieldCheck, Tag, ThumbsUp, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useNotifications } from "@/contexts/notification-context"

export default function DashboardOverview() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recentItems, setRecentItems] = useState<any[]>([])
  const { addNotification } = useNotifications() // Move hook to the top level
  const [notificationsSent, setNotificationsSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load items from localStorage
    const storedItems = localStorage.getItem("lostAndFoundItems")
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems)
      setItems(parsedItems)

      // Get 3 most recent items
      const sortedItems = [...parsedItems].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      setRecentItems(sortedItems.slice(0, 3))
    }
    setIsLoading(false)
  }, [])

  // Add notification matching logic
  useEffect(() => {
    if (items.length === 0) return

    // Find potential matches between lost and found items
    const lostItems = items.filter((item) => item.status === "lost")
    const foundItems = items.filter((item) => item.status === "found")

    // Simple matching algorithm based on categories and keywords
    lostItems.forEach((lostItem) => {
      foundItems.forEach((foundItem) => {
        // Match by category
        if (lostItem.category && foundItem.category && lostItem.category === foundItem.category) {
          // Check if the items were reported within a reasonable timeframe (7 days)
          const lostDate = new Date(lostItem.date)
          const foundDate = new Date(foundItem.date)
          const diffTime = Math.abs(foundDate.getTime() - lostDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays <= 7) {
            // Generate a unique ID for this match to prevent duplicate notifications
            const matchId = `match-${lostItem.id}-${foundItem.id}`

            // Check if this notification has already been sent
            if (!notificationsSent.has(matchId)) {
              addNotification({
                title: "Potential Match Found!",
                message: `A ${foundItem.category} was found that might match your lost ${lostItem.title}.`,
                type: "success",
                itemId: foundItem.id,
                link: `/dashboard/item/${foundItem.id}`,
              })

              // Mark this match as notified
              setNotificationsSent((prev) => new Set(prev).add(matchId))
            }
          }
        }
      })
    })
  }, [items, addNotification, notificationsSent])

  // Calculate statistics
  const totalItems = items.length
  const lostItems = items.filter((item) => item.status === "lost").length
  const foundItems = items.filter((item) => item.status === "found").length
  const resolvedItems = items.filter((item) => item.trackingStatus === "Resolved").length
  const inProgressItems = items.filter((item) => item.trackingStatus === "In Progress").length
  const openItems = items.filter((item) => item.trackingStatus === "Open").length

  // Calculate resolution rate
  const resolutionRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0

  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {}
  items.forEach((item) => {
    if (item.category) {
      categoryDistribution[item.category] = (categoryDistribution[item.category] || 0) + 1
    }
  })

  // Sort categories by count
  const sortedCategories = Object.entries(categoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Dashboard Overview" />
        <div className="flex items-center justify-center p-8">
          <p>Loading dashboard data...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard Overview" text="Welcome back to your Lost & Found dashboard">
        <Link href="/dashboard/new-item">
          <Button>Report an Item</Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in the system</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lost Items</CardTitle>
            <Search className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{lostItems}</div>
            <p className="text-xs text-muted-foreground">Items reported as lost</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Found Items</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{foundItems}</div>
            <p className="text-xs text-muted-foreground">Items reported as found</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{resolutionRate}%</div>
            <Progress value={resolutionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 mt-4">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Item Status Overview</CardTitle>
            <CardDescription>Current status of all reported items</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-1/4 text-sm font-medium">Open</div>
                  <div className="w-3/4 flex items-center gap-2">
                    <Progress value={(openItems / totalItems) * 100} className="h-2" />
                    <span className="text-sm font-medium">{openItems}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/4 text-sm font-medium">In Progress</div>
                  <div className="w-3/4 flex items-center gap-2">
                    <Progress value={(inProgressItems / totalItems) * 100} className="h-2 bg-muted" />
                    <span className="text-sm font-medium">{inProgressItems}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/4 text-sm font-medium">Resolved</div>
                  <div className="w-3/4 flex items-center gap-2">
                    <Progress value={(resolvedItems / totalItems) * 100} className="h-2 bg-muted" />
                    <span className="text-sm font-medium">{resolvedItems}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-medium">Top Categories</h4>
                <div className="grid grid-cols-2 gap-4">
                  {sortedCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-sm">{category}</div>
                      <div className="text-sm font-medium">{count}</div>
                    </div>
                  ))}

                  {sortedCategories.length === 0 && (
                    <div className="col-span-2 text-sm text-muted-foreground">No category data available</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest reported items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative mt-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          item.status === "lost" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {item.status === "lost" ? <Search className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                      </div>
                      <span className="absolute right-0 top-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.title}</p>
                        <Badge variant={item.status === "lost" ? "destructive" : "default"} className="ml-2">
                          {item.status === "lost" ? "Lost" : "Found"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No recent items found</div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/items" className="w-full">
              <Button variant="outline" className="w-full">
                View All Items
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/new-item">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Package className="h-5 w-5" />
                  <span>Report Item</span>
                </Button>
              </Link>
              <Link href="/dashboard/items">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Search className="h-5 w-5" />
                  <span>Browse Items</span>
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>View Statistics</span>
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Account Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
