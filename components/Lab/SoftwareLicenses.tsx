"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Search, Download, Trash, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { NewSoftwareDialog } from "./NewSoftwareDialog"
import { useToast } from "@/components/ui/use-toast"

interface SoftwareLicense {
  id: number
  vendor: string
  softwareName: string
  licenseName: string
  edition: string | null
  purchaseDate: string | null
  expireDate: string | null
  cost: number | null
  smsCost: number | null
  location: string | null
}

export function SoftwareLicenses() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Search software"]')?.focus()
      }
      // Ctrl/Cmd + N for new software
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setIsNewDialogOpen(true)
      }
      // Escape to clear selection
      if (e.key === 'Escape' && selectedItems.size > 0) {
        e.preventDefault()
        setSelectedItems(new Set())
      }
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        if (selectedItems.size === filteredLicenses.length) {
          setSelectedItems(new Set())
        } else {
          setSelectedItems(new Set(filteredLicenses.map(item => item.id)))
        }
      }
      // Delete key to show delete dialog
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault()
        handleBulkAction('delete')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedItems])

  // Fetch licenses
  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/lab/software")
      if (!response.ok) throw new Error("Failed to fetch licenses")
      const data = await response.json()
      setLicenses(data)
    } catch (error) {
      console.error("Error fetching licenses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch software licenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicenses()
  }, [])

  // Check for expiring licenses
  useEffect(() => {
    const expiringLicenses = licenses.filter(license => {
      if (!license.expireDate) return false
      const expiry = new Date(license.expireDate)
      const now = new Date()
      const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsUntilExpiry > 0 && monthsUntilExpiry <= 3
    })

    if (expiringLicenses.length > 0) {
      toast({
        title: "License Expiry Warning",
        description: `${expiringLicenses.length} license(s) expiring in the next 3 months`,
        variant: "destructive",
        duration: 10000,
      })
    }
  }, [licenses, toast])

  // Filter licenses based on search term
  const filteredLicenses = licenses.filter(license => 
    license.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.softwareName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (license.edition?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  // Function to calculate expiry status
  const getExpiryStatus = (expireDate: string | null) => {
    if (!expireDate) return null
    
    const now = new Date()
    const expiry = new Date(expireDate)
    const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsUntilExpiry < 0) return "text-destructive"
    if (monthsUntilExpiry < 3) return "text-orange-500"
    if (monthsUntilExpiry < 6) return "text-yellow-500"
    return "text-green-500"
  }

  // Function to format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Handle bulk selection
  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedItems(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedItems.size === filteredLicenses.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredLicenses.map(l => l.id)))
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return

    try {
      switch (action) {
        case 'export':
          const selectedData = licenses.filter(l => selectedItems.has(l.id))
          const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `software-licenses-${Date.now()}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast({
            title: "Export Complete",
            description: `Exported ${selectedItems.size} license(s)`,
          })
          break

        case 'delete':
          const response = await fetch('/api/lab/software/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedItems) }),
          })

          if (!response.ok) throw new Error('Failed to delete licenses')

          toast({
            title: "Success",
            description: `Deleted ${selectedItems.size} license(s)`,
          })
          setSelectedItems(new Set())
          fetchLicenses()
          break
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Software Licenses</h2>
        <div className="space-x-2">
          {selectedItems.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions ({selectedItems.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('delete')}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected
                  <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => setIsNewDialogOpen(true)}>
            Add Software
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search software... (⌘F)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox
                  checked={selectedItems.size === filteredLicenses.length && filteredLicenses.length > 0}
                  onCheckedChange={toggleAllSelection}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Software</TableHead>
              <TableHead>License Name</TableHead>
              <TableHead>Edition</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expire Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>SMS Cost</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredLicenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  {licenses.length === 0 ? (
                    "No software licenses found"
                  ) : (
                    "No matching software licenses"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredLicenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(license.id)}
                      onCheckedChange={() => toggleSelection(license.id)}
                      aria-label={`Select ${license.softwareName}`}
                    />
                  </TableCell>
                  <TableCell>{license.vendor}</TableCell>
                  <TableCell>{license.softwareName}</TableCell>
                  <TableCell>{license.licenseName}</TableCell>
                  <TableCell>{license.edition || "N/A"}</TableCell>
                  <TableCell>
                    {license.purchaseDate ? formatDate(license.purchaseDate) : "N/A"}
                  </TableCell>
                  <TableCell className={getExpiryStatus(license.expireDate) || ""}>
                    <div className="flex items-center gap-1">
                      {getExpiryStatus(license.expireDate) === "text-orange-500" && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      {license.expireDate ? formatDate(license.expireDate) : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(license.cost)}</TableCell>
                  <TableCell>{formatCurrency(license.smsCost)}</TableCell>
                  <TableCell>{license.location || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Keyboard shortcuts: ⌘F to search • ⌘N to add new software • ⌘A to select all • Delete to remove • Esc to clear selection
      </div>

      <NewSoftwareDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onSuccess={fetchLicenses}
      />
    </div>
  )
}
