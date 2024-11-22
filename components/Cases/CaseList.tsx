"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { NewCaseDialog } from "./NewCaseDialog"
import { formatDate } from "@/lib/utils"
import type { CaseWithRelations } from "@/lib/db/types"
import { CaseFilters } from "./CaseFilters"

export function CaseList() {
  const { data: session } = useSession()
  const [cases, setCases] = useState<CaseWithRelations[]>([])
  const [error, setError] = useState<string>("")
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    type: "all",
    assignee: "all",
    examiner: "all",
    investigator: "all",
    search: "",
  })

  const fetchCases = async () => {
    try {
      console.log('Fetching cases...')
      const response = await fetch('/api/cases')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to fetch cases')
      }
      const data = await response.json()
      console.log('Fetched cases:', data)
      setCases(data)
    } catch (error) {
      console.error('Error fetching cases:', error)
      setError(error instanceof Error ? error.message : 'Failed to load cases')
    }
  }

  useEffect(() => {
    if (session) {
      fetchCases()
    }
  }, [session])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = !filters.search || 
      caseItem.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (caseItem.description?.toLowerCase() || "").includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === "all" || caseItem.status === filters.status
    const matchesPriority = filters.priority === "all" || caseItem.casePriority === filters.priority
    const matchesCategory = filters.category === "all" || caseItem.caseCategory === filters.category
    const matchesType = filters.type === "all" || caseItem.caseType === filters.type
    const matchesAssignee = filters.assignee === "all" || 
      (caseItem.caseAssignee?.toLowerCase() || "").includes(filters.assignee.toLowerCase())
    const matchesExaminer = filters.examiner === "all" || 
      (caseItem.caseExaminer?.toLowerCase() || "").includes(filters.examiner.toLowerCase())
    const matchesInvestigator = filters.investigator === "all" || 
      (caseItem.caseInvestigator?.toLowerCase() || "").includes(filters.investigator.toLowerCase())

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesType && 
           matchesAssignee && matchesExaminer && matchesInvestigator
  })

  if (!session) {
    return (
      <div className="text-center py-8">
        Please log in to view cases
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cases</h2>
        <NewCaseDialog onCaseCreated={fetchCases} />
      </div>

      <CaseFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <div className="text-sm text-destructive text-center">{error}</div>
      )}

      <div className="rounded-md border w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Examiner</TableHead>
              <TableHead>Investigator</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell className="font-medium">
                  {caseItem.name}
                </TableCell>
                <TableCell>{caseItem.caseDate ? formatDate(caseItem.caseDate) : '-'}</TableCell>
                <TableCell>{caseItem.caseCategory || '-'}</TableCell>
                <TableCell>{caseItem.caseType || '-'}</TableCell>
                <TableCell>{caseItem.status}</TableCell>
                <TableCell>{caseItem.casePriority || '-'}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {caseItem.description || '-'}
                </TableCell>
                <TableCell>{caseItem.caseAssignee || '-'}</TableCell>
                <TableCell>{caseItem.caseExaminer || '-'}</TableCell>
                <TableCell>{caseItem.caseInvestigator || '-'}</TableCell>
                <TableCell>{caseItem.organizationName || '-'}</TableCell>
                <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
                <TableCell>{formatDate(caseItem.updatedAt)}</TableCell>
                <TableCell>
                  <Link href={`/case/${caseItem.id}`}>
                    <Button variant="default" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredCases.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="text-center">
                  No cases found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
