"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemCard } from "@/components/item-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllItems, initializeDB } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

// Item categories
const itemCategories = ["Electronics", "Clothing", "Jewelry", "Bags", "Keys", "Documents", "Pets", "Other"]

// Tracking statuses
const trackingStatuses = ["Open", "In Progress", "Resolved"]

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get status from URL if present
  const statusParam = searchParams.get("status")
  const [activeTab, setActiveTab] = useState(statusParam || "all")

  // Load items from IndexedDB on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        await initializeDB()
        const loadedItems = await getAllItems()
        setItems(loadedItems)
      } catch (error) {
        console.error("Error loading items:", error)
        toast({
          title: "Error",
          description: "Failed to load items. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [toast])

  // Update active tab when URL status param changes
  useEffect(() => {
    if (statusParam) {
      setActiveTab(statusParam)
    }
  }, [statusParam])

  const filteredItems = items.filter((item) => {
    // Text search
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category))

    // Status filter
    const matchesStatus =
      selectedStatuses.length === 0 || (item.trackingStatus && selectedStatuses.includes(item.trackingStatus))

    // Status tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "lost" && item.status === "lost") ||
      (activeTab === "found" && item.status === "found")

    return matchesSearch && matchesCategory && matchesStatus && matchesTab
  })

  const lostItems = filteredItems.filter((item) => item.status === "lost")
  const foundItems = filteredItems.filter((item) => item.status === "found")

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedStatuses([])
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="All Items" text="Loading items..." />
        <div className="flex items-center justify-center p-8">
          <p>Loading items...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="All Items" text="Browse and manage lost and found items">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/new-item">
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> New Item
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Items</SheetTitle>
                <SheetDescription>Filter items by category and status</SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {itemCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {trackingStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => handleStatusChange(status)}
                        />
                        <Label htmlFor={`status-${status}`}>{status}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="lost">Lost Items</TabsTrigger>
              <TabsTrigger value="found">Found Items</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No items found</p>
                  <Link href="/dashboard/new-item" className="mt-2">
                    <Button variant="link" size="sm">
                      Add a new item
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="lost" className="space-y-4">
              {lostItems.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No lost items found</p>
                  <Link href="/dashboard/new-item" className="mt-2">
                    <Button variant="link" size="sm">
                      Report a lost item
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lostItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="found" className="space-y-4">
              {foundItems.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No found items found</p>
                  <Link href="/dashboard/new-item" className="mt-2">
                    <Button variant="link" size="sm">
                      Report a found item
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {foundItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  )
}
