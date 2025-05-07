import Link from "next/link"
import { CalendarIcon, MapPin, Tag, MessageCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface Item {
  id: string
  title: string
  description: string
  location: string
  date: string
  status: "lost" | "found"
  image: string
  category?: string
  trackingStatus?: string
  comments?: any[]
}

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">{item.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={item.status === "lost" ? "destructive" : "default"}>
                {item.status === "lost" ? "Lost" : "Found"}
              </Badge>

              {item.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.category}
                </Badge>
              )}

              {item.trackingStatus && (
                <Badge
                  variant={
                    item.trackingStatus === "Resolved"
                      ? "default"
                      : item.trackingStatus === "In Progress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {item.trackingStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-2 flex flex-col space-y-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          {item.comments && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageCircle className="mr-1 h-3 w-3" />
              <span>
                {item.comments.length} comment{item.comments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={`/dashboard/item/${item.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
