"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers"
import { CASE_CATEGORIES, CASE_CATEGORY_LIST } from "@/lib/constants/caseTypes"

interface CaseFiltersProps {
  filters: {
    status: string
    priority: string
    category: string
    type: string
    assignee: string
    examiner: string
    investigator: string
    search: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function CaseFilters({ filters, onFilterChange }: CaseFiltersProps) {
  const { orgUsers, isLoading, getUserDisplayName } = useOrganizationUsers()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg bg-background">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search cases..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={filters.priority}
          onValueChange={(value) => onFilterChange("priority", value)}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => {
            onFilterChange("category", value)
            onFilterChange("type", "all") // Reset type when category changes
          }}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {CASE_CATEGORY_LIST.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange("type", value)}
          disabled={filters.category === "all"}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {filters.category !== "all" && CASE_CATEGORIES[filters.category as keyof typeof CASE_CATEGORIES]?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Select
          value={filters.assignee}
          onValueChange={(value) => onFilterChange("assignee", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="assignee">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {orgUsers?.currentUser && (
              <SelectItem value={orgUsers.currentUser.name || "Current User"}>
                Current User (You)
              </SelectItem>
            )}
            {orgUsers?.users.map((user) => (
              <SelectItem key={user.id} value={getUserDisplayName(user)}>
                {getUserDisplayName(user)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="examiner">Examiner</Label>
        <Select
          value={filters.examiner}
          onValueChange={(value) => onFilterChange("examiner", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="examiner">
            <SelectValue placeholder="Select examiner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {orgUsers?.currentUser && (
              <SelectItem value={orgUsers.currentUser.name || "Current User"}>
                Current User (You)
              </SelectItem>
            )}
            {orgUsers?.users.map((user) => (
              <SelectItem key={user.id} value={getUserDisplayName(user)}>
                {getUserDisplayName(user)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investigator">Investigator</Label>
        <Select
          value={filters.investigator}
          onValueChange={(value) => onFilterChange("investigator", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="investigator">
            <SelectValue placeholder="Select investigator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {orgUsers?.currentUser && (
              <SelectItem value={orgUsers.currentUser.name || "Current User"}>
                Current User (You)
              </SelectItem>
            )}
            {orgUsers?.users.map((user) => (
              <SelectItem key={user.id} value={getUserDisplayName(user)}>
                {getUserDisplayName(user)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
