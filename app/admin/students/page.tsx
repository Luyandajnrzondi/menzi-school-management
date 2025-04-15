"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search, Plus, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export default function StudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)

    // Check if user is admin or principal
    if (parsedUser.role !== "admin" && parsedUser.role !== "principal") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    fetchStudents()
  }, [router])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          student_classes(
            id,
            class_id,
            classes(
              id,
              name,
              grades(id, name)
            )
          )
        `)
        .order("last_name", { ascending: true })

      if (error) throw error

      setStudents(data || [])
      setFilteredStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredStudents(students)
      return
    }

    const filtered = students.filter(
      (student) =>
        student.first_name.toLowerCase().includes(query) ||
        student.last_name.toLowerCase().includes(query) ||
        student.student_id.toLowerCase().includes(query),
    )

    setFilteredStudents(filtered)
  }

  const getCurrentClass = (student: any) => {
    if (!student.student_classes || student.student_classes.length === 0) {
      return "Not Assigned"
    }

    // Sort by most recent academic year
    const sortedClasses = [...student.student_classes].sort((a, b) => {
      if (!a.classes || !b.classes) return 0
      return b.classes.academic_year - a.classes.academic_year
    })

    const currentClass = sortedClasses[0]
    if (!currentClass.classes || !currentClass.classes.grades) {
      return "Unknown Class"
    }

    return `${currentClass.classes.grades.name} ${currentClass.classes.name}`
  }

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Students</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8 w-full md:w-[300px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button asChild>
              <Link href="/admin/students/add">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Manage and view all students in the school</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Student ID</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Gender</th>
                      <th className="py-3 px-4 text-left">Current Class</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{student.student_id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.profile_image_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {student.first_name.charAt(0)}
                                {student.last_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {student.first_name} {student.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize">{student.gender}</td>
                        <td className="py-3 px-4">{getCurrentClass(student)}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/students/${student.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  {searchQuery ? "No students match your search criteria." : "No students found."}
                </p>
                <Button asChild>
                  <Link href="/admin/students/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
