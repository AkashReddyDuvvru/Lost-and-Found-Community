"use client"

import { Bell } from "lucide-react"
import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotifications, type Notification } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications()
  const [open, setOpen] = useState(false)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    setOpen(false)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto py-1 px-2 text-xs">
                Mark all as read
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="h-auto py-1 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <ScrollArea className="h-[calc(80vh-8rem)] max-h-80">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || "#"}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn("flex flex-col gap-1 p-4 hover:bg-muted", !notification.read && "bg-muted/50")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                      {notification.title}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        notification.type === "success" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                        notification.type === "warning" &&
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                        notification.type === "error" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                        notification.type === "info" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                      )}
                    >
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
