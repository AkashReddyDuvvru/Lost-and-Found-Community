"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Bell, Check, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useNotifications, type Notification } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications()
  const [selectedTab, setSelectedTab] = useState("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === "all") return true
    if (selectedTab === "unread") return !notification.read
    if (selectedTab === "read") return notification.read
    return true
  })

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "PPpp")
  }

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "info":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="View and manage your notifications">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllNotifications}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Notifications</CardTitle>
              <CardDescription>Stay updated on your lost and found items</CardDescription>
            </div>
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No notifications</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any {selectedTab !== "all" ? selectedTab + " " : ""}notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative rounded-lg border p-4 transition-colors",
                    !notification.read && "bg-muted/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
                          {notification.title}
                        </h4>
                        <Badge className={cn("px-2 py-0.5", getTypeColor(notification.type))}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="outline" className="px-2 py-0.5">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  {notification.link && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-end">
                        <Link href={notification.link}>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View details
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
