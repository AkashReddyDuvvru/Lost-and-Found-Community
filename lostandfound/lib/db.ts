// Simple in-browser database using IndexedDB
export interface Item {
  id: string
  title: string
  description: string
  location: string
  date: string
  status: "lost" | "found"
  image: string
  imageData?: string // Base64 data for the image
  category?: string
  trackingStatus?: string
  comments?: any[]
  contactDetails?: {
    name: string
    phone: string
    email: string
  }
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string // In a real app, this would be hashed
}

// Database name and store
const DB_NAME = "LostAndFoundDB"
const STORE_NAME = "items"
const IMAGE_STORE = "images"
const USER_STORE = "users"
const DB_VERSION = 3 // Increased version to handle schema migration

// Open database connection
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Failed to open database"))
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })

        // Create indexes for common queries
        store.createIndex("status", "status", { unique: false })
        store.createIndex("category", "category", { unique: false })
        store.createIndex("trackingStatus", "trackingStatus", { unique: false })
      }

      // Create image store if it doesn't exist
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: "id" })
      }

      // Create user store if it doesn't exist
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: "id" })
        userStore.createIndex("email", "email", { unique: true })
      }
    }
  })
}

// Add or update an item
export async function saveItem(item: Item): Promise<string> {
  const db = await openDB()

  // If there's image data, store it separately
  if (item.imageData) {
    await saveImage(item.id, item.imageData)

    // Remove the imageData from the item to avoid duplication
    const { imageData, ...itemWithoutImageData } = item
    item = itemWithoutImageData as Item
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const request = store.put(item)

    request.onsuccess = () => {
      resolve(item.id)
    }

    request.onerror = () => {
      reject(new Error("Failed to save item"))
    }
  })
}

// Save image data
export async function saveImage(id: string, imageData: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], "readwrite")
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.put({ id, data: imageData })

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to save image"))
    }
  })
}

// Get image data
export async function getImage(id: string): Promise<string | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], "readonly")
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.get(id)

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result
      resolve(result ? result.data : null)
    }

    request.onerror = () => {
      reject(new Error("Failed to get image"))
    }
  })
}

// Delete image data
export async function deleteImage(id: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE], "readwrite")
    const store = transaction.objectStore(IMAGE_STORE)

    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to delete image"))
    }
  })
}

// Get all items
export async function getAllItems(): Promise<Item[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)

    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result)
    }

    request.onerror = () => {
      reject(new Error("Failed to get items"))
    }
  })
}

// Get item by ID
export async function getItemById(id: string): Promise<Item | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)

    const request = store.get(id)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result || null)
    }

    request.onerror = () => {
      reject(new Error("Failed to get item"))
    }
  })
}

// Delete item by ID
export async function deleteItem(id: string): Promise<void> {
  const db = await openDB()

  // First delete the image
  try {
    await deleteImage(id)
  } catch (error) {
    console.error("Error deleting image:", error)
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to delete item"))
    }
  })
}

// Get items by status
export async function getItemsByStatus(status: "lost" | "found"): Promise<Item[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("status")

    const request = index.getAll(status)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result)
    }

    request.onerror = () => {
      reject(new Error("Failed to get items by status"))
    }
  })
}

// User functions
export async function createUser(user: User): Promise<string> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], "readwrite")
    const store = transaction.objectStore(USER_STORE)

    const request = store.put(user)

    request.onsuccess = () => {
      resolve(user.id)
    }

    request.onerror = (event) => {
      // Check if error is due to duplicate email
      if ((event.target as IDBRequest).error?.name === "ConstraintError") {
        reject(new Error("Email already exists"))
      } else {
        reject(new Error("Failed to create user"))
      }
    }
  })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], "readonly")
    const store = transaction.objectStore(USER_STORE)
    const index = store.index("email")

    const request = index.get(email)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result || null)
    }

    request.onerror = () => {
      reject(new Error("Failed to get user"))
    }
  })
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], "readonly")
    const store = transaction.objectStore(USER_STORE)

    const request = store.get(id)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result || null)
    }

    request.onerror = () => {
      reject(new Error("Failed to get user"))
    }
  })
}

// Initialize database with sample data if empty
export async function initializeDB() {
  try {
    const items = await getAllItems()

    // If there are no items, add sample data
    if (items.length === 0) {
      const sampleItems: Item[] = [
        {
          id: "1",
          title: "Blue Backpack",
          description: "Lost at Central Park on June 15th. Contains laptop and books.",
          location: "Central Park, New York",
          date: "2023-06-15",
          status: "lost",
          image: "/placeholder.svg?height=200&width=300",
          category: "Bags",
          trackingStatus: "Open",
          comments: [
            {
              id: "c1",
              text: "I think I saw a similar backpack at the lost and found office.",
              author: "Jane Smith",
              date: "2023-06-16T14:30:00Z",
            },
          ],
          contactDetails: {
            name: "Zombie Reddy",
            phone: "+91 98765 43210",
            email: "zombie.reddy@example.com",
          },
        },
        {
          id: "2",
          title: "iPhone 13 Pro",
          description: "Lost at the coffee shop on Main Street. Has a blue case.",
          location: "Starbucks, Main Street",
          date: "2023-06-18",
          status: "lost",
          image: "/placeholder.svg?height=200&width=300",
          category: "Electronics",
          trackingStatus: "In Progress",
          comments: [],
          contactDetails: {
            name: "Ravi Kumar",
            phone: "+91 87654 32109",
            email: "ravi@example.com",
          },
        },
        {
          id: "3",
          title: "Gold Watch",
          description: "Found near the library entrance. Brand is Timex.",
          location: "Public Library",
          date: "2023-06-20",
          status: "found",
          image: "/placeholder.svg?height=200&width=300",
          category: "Jewelry",
          trackingStatus: "Open",
          comments: [],
          contactDetails: {
            name: "Priya Sharma",
            phone: "+91 76543 21098",
            email: "priya@example.com",
          },
        },
      ]

      for (const item of sampleItems) {
        await saveItem(item)
      }
    }
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

// Session management
export function setCurrentUser(user: User): void {
  // Remove sensitive information before storing
  const { password, ...safeUser } = user
  localStorage.setItem("currentUser", JSON.stringify(safeUser))
}

export function getCurrentUser(): Partial<User> | null {
  const userJson = localStorage.getItem("currentUser")
  if (!userJson) return null
  return JSON.parse(userJson)
}

export function logoutUser(): void {
  localStorage.removeItem("currentUser")
}
