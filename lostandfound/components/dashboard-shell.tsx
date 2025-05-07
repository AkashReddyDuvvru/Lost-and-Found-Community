"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  User,
  X,
  Bell,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { Logo } from "@/components/logo"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ContactUs } from "@/components/contact-us"
import { useAuth } from "@/contexts/auth-context"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      router.push("/login")
    }
  }, [user, router])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navigation = [
    {
      name: "Overview",
      href: "/dashboard/overview",
      icon: Home,
      current: pathname === "/dashboard/overview",
    },
    {
      name: "All Items",
      href: "/dashboard/items",
      icon: Package,
      current: pathname === "/dashboard/items",
    },
    {
      name: "Lost Items",
      href: "/dashboard/items?status=lost",
      icon: Search,
      current: pathname.includes("/dashboard/items") && pathname.includes("status=lost"),
    },
    {
      name: "Found Items",
      href: "/dashboard/items?status=found",
      icon: Package,
      current: pathname.includes("/dashboard/items") && pathname.includes("status=found"),
    },
    {
      name: "Report Item",
      href: "/dashboard/new-item",
      icon: Plus,
      current: pathname === "/dashboard/new-item",
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      current: pathname === "/dashboard/notifications",
    },
    {
      name: "Statistics",
      href: "/dashboard/profile?tab=statistics",
      icon: BarChart3,
      current: pathname.includes("/dashboard/profile") && pathname.includes("tab=statistics"),
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      current: pathname === "/dashboard/profile",
    },
    {
      name: "Settings",
      href: "/dashboard/profile?tab=settings",
      icon: Settings,
      current: pathname.includes("/dashboard/profile") && pathname.includes("tab=settings"),
    },
  ]

  // If not authenticated yet, show loading
  if (!user && typeof window !== "undefined") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const userInitials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U"

  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <MobileSidebar
              navigation={navigation}
              onClose={closeMobileSidebar}
              onContactClick={() => {
                setIsMobileOpen(false)
                setContactDialogOpen(true)
              }}
              user={user}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold">
          {/* Fixed: Use linkWrapper={false} and wrap with Link manually */}
          <Link href="/dashboard/overview">
            <Logo size="small" linkWrapper={false} />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <NotificationBell />
          <UserNav user={user} onLogout={handleLogout} />
          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className={cn("fixed hidden h-screen border-r bg-background lg:flex", isCollapsed ? "w-16" : "w-64")}>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              {!isCollapsed && (
                <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold">
                  {/* Fixed: Use linkWrapper={false} to avoid nested links */}
                  <Logo size="small" showText={false} linkWrapper={false} />
                  <span className="text-xl">LOST & FOUND</span>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            <ScrollArea className="flex-1 py-2">
              <nav className="grid gap-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      item.current ? "bg-accent text-accent-foreground" : "transparent",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                ))}

                {/* Contact Us Button - Fixed styling and made it more prominent */}
                <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground",
                        isCollapsed && "justify-center px-2",
                        "mt-4 border border-primary/20",
                      )}
                    >
                      <Phone className={cn("h-5 w-5", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                      {!isCollapsed && <span>Contact Us</span>}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Contact Us</DialogTitle>
                      <DialogDescription>Get in touch with our team</DialogDescription>
                    </DialogHeader>
                    <ContactUs />
                  </DialogContent>
                </Dialog>
              </nav>
            </ScrollArea>
            <div className="mt-auto p-4">
              {!isCollapsed && (
                <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5 text-sm">
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="flex justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={cn("flex flex-1 flex-col", isCollapsed ? "lg:pl-16" : "lg:pl-64")}>
          <header className="sticky top-0 z-10 hidden h-16 items-center gap-4 border-b bg-background px-6 lg:flex">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ModeToggle />
              <UserNav user={user} onLogout={handleLogout} />
            </div>
          </header>
          <main className="flex-1">
            <div className="container grid items-start gap-4 py-8">{children}</div>
          </main>
        </div>
      </div>

      {/* Contact Dialog for Mobile */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>Get in touch with our team</DialogDescription>
          </DialogHeader>
          <ContactUs />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MobileSidebar({
  navigation,
  onClose,
  onContactClick,
  user,
  onLogout,
}: {
  navigation: any[]
  onClose: () => void
  onContactClick: () => void
  user: any
  onLogout: () => void
}) {
  const userInitials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U"

  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User"

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold" onClick={onClose}>
          {/* Fixed: Use linkWrapper={false} to avoid nested links */}
          <Logo size="small" linkWrapper={false} />
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                item.current ? "bg-accent text-accent-foreground" : "transparent",
              )}
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}

          {/* Contact Us Button - Fixed styling and made it more prominent */}
          <button
            className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground"
            onClick={onContactClick}
          >
            <Phone className="h-4 w-4" />
            <span>Contact Us</span>
          </button>
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 text-sm">
            <div className="font-medium">{userName}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <Button variant="destructive" className="mt-2 w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function UserNav({ user, onLogout }: { user: any; onLogout: () => void }) {
  const userInitials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U"

  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile?tab=settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
