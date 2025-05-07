"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPin, Upload, Navigation } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveItem } from "@/lib/db"

// Item categories
const itemCategories = ["Electronics", "Clothing", "Jewelry", "Bags", "Keys", "Documents", "Pets", "Other"]

export default function NewItemPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState<Date>()
  const [status, setStatus] = useState("lost")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [category, setCategory] = useState("")
  const [trackingStatus, setTrackingStatus] = useState("Open")

  // Contact details
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Convert the file to a data URL for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Reverse geocoding to get address (simplified for demo)
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        setIsGettingLocation(false)

        toast({
          title: "Location detected",
          description: "Your current location has been added.",
        })
      },
      (error) => {
        setIsGettingLocation(false)
        toast({
          title: "Location error",
          description: error.message,
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true },
    )
  }

  const validateEmail = (email: string) => {
    // Check if email is from SRM domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/
    if (!email) {
      setEmailError("")
      return true
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please use your SRM email (example@srmist.edu.in)")
      return false
    }
    setEmailError("")
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setContactEmail(email)
    validateEmail(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !location || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (contactEmail && !validateEmail(contactEmail)) {
      toast({
        title: "Invalid email",
        description: "Please use your SRM email (example@srmist.edu.in).",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create new item object
      const newItem = {
        id: Date.now().toString(), // Generate a unique ID
        title,
        description,
        location,
        date: date.toISOString(),
        status: status as "lost" | "found",
        image: imagePreview || "/placeholder.svg?height=200&width=300",
        imageData: imagePreview, // Store the actual image data
        contactDetails: {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        },
        category,
        trackingStatus,
        comments: [],
      }

      // Save to IndexedDB
      await saveItem(newItem)

      toast({
        title: "Item reported",
        description: `Your ${status} item has been reported successfully.`,
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Report an Item" text="Provide details about a lost or found item" />
      <div className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Item Status</Label>
                  <RadioGroup id="status" value={status} onValueChange={setStatus} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lost" id="lost" />
                      <Label htmlFor="lost">Lost Item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="found" id="found" />
                      <Label htmlFor="found">Found Item</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blue Backpack, iPhone 13"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingStatus">Tracking Status</Label>
                    <Select value={trackingStatus} onValueChange={setTrackingStatus}>
                      <SelectTrigger id="trackingStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the item..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Where was it lost/found?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="pl-8"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      <Navigation className="h-4 w-4" />
                      <span className="sr-only">Get current location</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? date.toLocaleDateString() : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Contact Details Section */}
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="font-medium">Contact Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name</Label>
                    <Input
                      id="contactName"
                      placeholder="John Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@srmist.edu.in"
                      value={contactEmail}
                      onChange={handleEmailChange}
                      className={emailError ? "border-red-500" : ""}
                    />
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Item Image</Label>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Item preview"
                            className="h-[300px] w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => {
                              setImage(null)
                              setImagePreview(null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="image-upload"
                          className="flex h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-4 py-8 text-center hover:bg-muted/50"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm font-medium text-muted-foreground">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">JPG, PNG or GIF, up to 10MB</p>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardShell>
  )
}
