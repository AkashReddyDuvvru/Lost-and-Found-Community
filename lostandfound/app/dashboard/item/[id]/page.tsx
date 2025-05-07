"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPin, ArrowLeft, Edit, Trash2, Phone, Mail, User, MessageCircle, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/contexts/notification-context"
import { getItemById, saveItem, deleteItem, getImage, deleteImage } from "@/lib/db"
import { initializeDB } from "@/lib/db"
import { useAuth } from "@/contexts/auth-context"

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [trackingStatus, setTrackingStatus] = useState("")
  const [imageData, setImageData] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  useEffect(() => {
    const loadItem = async () => {
      try {
        // Initialize the database if needed
        await initializeDB()

        // Get item from IndexedDB
        const foundItem = await getItemById(params.id)

        if (foundItem) {
          setItem(foundItem)
          setTrackingStatus(foundItem.trackingStatus || "Open")

          // Load image data if available
          const image = await getImage(params.id)
          if (image) {
            setImageData(image)
          }
        } else {
          toast({
            title: "Item not found",
            description: "The requested item could not be found.",
            variant: "destructive",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error loading item:", error)
        toast({
          title: "Error",
          description: "Failed to load item details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItem()
  }, [params.id, router, toast])

  const handleDelete = async () => {
    try {
      if (item) {
        await deleteItem(item.id)

        toast({
          title: "Item deleted",
          description: "The item has been deleted successfully.",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      })
    }
  }

  const handleOpenMap = () => {
    // Check if the location is coordinates
    if (item.location && item.location.includes(",")) {
      const [lat, lng] = item.location.split(",").map((coord: string) => coord.trim())
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
    } else {
      // If not coordinates, search for the location name
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}`, "_blank")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const comment = {
      id: `c${Date.now()}`,
      text: newComment,
      author: user ? `${user.firstName} ${user.lastName}` : "You", // Use the logged-in user's name
      date: new Date().toISOString(),
    }

    const updatedItem = {
      ...item,
      comments: [...(item.comments || []), comment],
    }

    try {
      await saveItem(updatedItem)
      setItem(updatedItem)
      setNewComment("")

      // Add notification for new comment
      addNotification({
        title: `New Comment`,
        message: `You added a comment to "${item.title}".`,
        type: "info",
        itemId: item.id,
        link: `/dashboard/item/${item.id}`,
      })

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setTrackingStatus(newStatus)

    const updatedItem = {
      ...item,
      trackingStatus: newStatus,
    }

    try {
      await saveItem(updatedItem)
      setItem(updatedItem)

      // If the item is marked as resolved, delete the image
      if (newStatus === "Resolved") {
        try {
          await deleteImage(item.id)
          setImageData(null) // Clear the image data in the UI

          // Add notification for resolved item
          addNotification({
            title: `Item Resolved`,
            message: `Your ${item.status} item "${item.title}" has been marked as resolved.`,
            type: "success",
            itemId: item.id,
            link: `/dashboard/item/${item.id}`,
          })

          toast({
            title: "Item resolved",
            description: "The item has been marked as resolved and its image has been removed from the database.",
          })
        } catch (error) {
          console.error("Error deleting image:", error)
        }
      } else {
        // Add notification for status change
        addNotification({
          title: `Item Status Updated`,
          message: `The status of "${item.title}" has been updated to ${newStatus}.`,
          type: newStatus === "Resolved" ? "success" : "info",
          itemId: item.id,
          link: `/dashboard/item/${item.id}`,
        })

        toast({
          title: "Status updated",
          description: `Item status updated to ${newStatus}.`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Item Details" />
        <div className="flex items-center justify-center p-8">
          <p>Loading item details...</p>
        </div>
      </DashboardShell>
    )
  }

  if (!item) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Item Not Found" />
        <div className="flex flex-col items-center justify-center p-8">
          <p className="mb-4 text-muted-foreground">The requested item could not be found.</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const hasContactDetails =
    item.contactDetails && (item.contactDetails.name || item.contactDetails.phone || item.contactDetails.email)

  return (
    <DashboardShell>
      <DashboardHeader heading="Item Details">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/edit-item/${item.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square w-full overflow-hidden rounded-md">
                <img
                  src={imageData || item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Comments</h3>
                  <Badge variant="outline" className="ml-2">
                    {item.comments?.length || 0}
                  </Badge>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment: any) => (
                      <div key={comment.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.date).toLocaleString()}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{item.title}</h2>
                  <Badge variant={item.status === "lost" ? "destructive" : "default"}>
                    {item.status === "lost" ? "Lost" : "Found"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.category && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {item.category}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      trackingStatus === "Resolved"
                        ? "default"
                        : trackingStatus === "In Progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {trackingStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status:</label>
                  <Select value={trackingStatus} onValueChange={handleUpdateStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-muted-foreground">{item.description}</p>
                <div className="space-y-2 rounded-md bg-muted p-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.location}</span>
                    <Button variant="ghost" size="sm" className="ml-2 h-7 px-2 text-xs" onClick={handleOpenMap}>
                      View on Map
                    </Button>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {hasContactDetails && (
                  <div className="pt-4">
                    <h3 className="mb-2 font-semibold">Contact Information</h3>
                    {item.contactDetails.name && (
                      <div className="flex items-center text-sm mb-2">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{item.contactDetails.name}</span>
                      </div>
                    )}
                    {item.contactDetails.phone && (
                      <div className="flex items-center text-sm mb-2">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{item.contactDetails.phone}</span>
                      </div>
                    )}
                    {item.contactDetails.email && (
                      <div className="flex items-center text-sm mb-2">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{item.contactDetails.email}</span>
                      </div>
                    )}

                    <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 w-full">Contact Owner</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contact Information</DialogTitle>
                          <DialogDescription>
                            Use the following information to contact the {item.status === "lost" ? "owner" : "finder"}{" "}
                            of this item.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {item.contactDetails.name && (
                            <div className="flex items-center">
                              <User className="mr-2 h-5 w-5" />
                              <span className="font-medium">{item.contactDetails.name}</span>
                            </div>
                          )}
                          {item.contactDetails.phone && (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-5 w-5" />
                              <a
                                href={`tel:${item.contactDetails.phone}`}
                                className="font-medium text-primary underline"
                              >
                                {item.contactDetails.phone}
                              </a>
                            </div>
                          )}
                          {item.contactDetails.email && (
                            <div className="flex items-center">
                              <Mail className="mr-2 h-5 w-5" />
                              <a
                                href={`mailto:${item.contactDetails.email}`}
                                className="font-medium text-primary underline"
                              >
                                {item.contactDetails.email}
                              </a>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {!hasContactDetails && (
                  <div className="pt-4">
                    <h3 className="mb-2 font-semibold">Contact Information</h3>
                    <p className="text-sm text-muted-foreground">No contact information provided for this item.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
