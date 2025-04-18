"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Link } from "next/link"

interface DashboardLayoutProps {
  children: ReactNode
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
}

function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-2 text-xl font-bold">School Management</h1>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{user?.name ? user.name.charAt(0) : user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/my-profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/logout" className="w-full">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t">
          <Sidebar user={user} />
        </div>
      )}
    </div>
  )
}

export function DashboardLayout({ children, user: propUser }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState(propUser)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      router.push("/login")
      return
    }

    // If no user was passed as prop, use the one from localStorage
    if (!propUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [propUser, router])

  if (!user) {
    return null // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="md:hidden">
        <MobileNav user={user} />
      </div>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 md:pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
