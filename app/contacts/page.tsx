"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Mail, Phone, Building2, Search, MoreHorizontal, Star, AlertCircle, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  organization: string
  notes: string | null
  createdAt: string
  updatedAt: string
  important?: boolean
  selected?: boolean
}

interface Case {
  id: number
  name: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    notes: ""
  })
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showImportantDialog, setShowImportantDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [availableCases, setAvailableCases] = useState<Case[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")
  const { data: session } = useSession()

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    loadCases()
  }, [])

  async function loadContacts() {
    try {
      const response = await fetch('/api/contacts')
      if (!response.ok) throw new Error('Failed to load contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadCases() {
    try {
      const response = await fetch('/api/cases')
      if (!response.ok) throw new Error('Failed to load cases')
      const data = await response.json()
      setAvailableCases(data)
    } catch (error) {
      console.error('Error loading cases:', error)
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      })

      if (!response.ok) throw new Error('Failed to create contact')

      const created = await response.json()
      setContacts([...contacts, created])
      setShowNewDialog(false)
      setNewContact({ name: "", email: "", phone: "", organization: "", notes: "" })

      toast({
        title: "Contact Created",
        description: "The contact has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating contact:', error)
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete contact')

      setContacts(contacts.filter(contact => contact.id !== id))
      toast({
        title: "Contact Deleted",
        description: "The contact has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  async function handleImportant(contact: Contact) {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, important: true }),
      })

      if (!response.ok) throw new Error('Failed to update contact')

      await loadContacts()
      
      toast({
        title: "Contact Updated",
        description: `${contact.name} marked as important`,
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  async function handleRemoveImportant(contact: Contact) {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, important: false }),
      })

      if (!response.ok) throw new Error('Failed to update contact')

      await loadContacts()
      
      toast({
        title: "Status Updated",
        description: `${contact.name} is no longer marked as important`,
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  async function handleUpdate(contact: Contact) {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      })

      if (!response.ok) throw new Error('Failed to update contact')

      await loadContacts()
      
      toast({
        title: "Contact Updated",
        description: "Changes saved successfully",
      })
      setShowEditDialog(false)
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage contacts related to your cases
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} className={contact.important ? "bg-yellow-50/50" : ""}>
                <TableCell>
                  {contact.important && (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500/75" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/contacts/${contact.id}`} 
                    className="font-medium hover:underline"
                  >
                    {contact.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.organization}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingContact(contact)
                        setShowEditDialog(true)
                      }}>
                        Edit Contact
                      </DropdownMenuItem>
                      {!contact.important ? (
                        <DropdownMenuItem onClick={() => {
                          setEditingContact(contact)
                          setShowImportantDialog(true)
                        }}>
                          <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          Mark as Important
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRemoveImportant(contact)}>
                          <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                          Remove Important Status
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600"
                      >
                        Delete Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setEditingContact(contact)
                        setShowMessageDialog(true)
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={newContact.organization}
                onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Enter any additional notes"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showImportantDialog} onOpenChange={setShowImportantDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Mark Contact as Important
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 pt-2">
                <p className="font-medium text-foreground">
                  {editingContact?.name} will be marked as an important contact.
                </p>
                <p className="text-sm text-muted-foreground">
                  Important contacts will be highlighted in your list and can be filtered separately.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleImportant(editingContact!)
                setShowImportantDialog(false)
              }}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Mark as Important
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingContact?.name || ''}
                onChange={(e) => setEditingContact(prev => 
                  prev ? {...prev, name: e.target.value} : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={editingContact?.email || ''}
                onChange={(e) => setEditingContact(prev => 
                  prev ? {...prev, email: e.target.value} : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editingContact?.phone || ''}
                onChange={(e) => setEditingContact(prev => 
                  prev ? {...prev, phone: e.target.value} : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Organization</Label>
              <Input
                id="edit-organization"
                value={editingContact?.organization || ''}
                onChange={(e) => setEditingContact(prev => 
                  prev ? {...prev, organization: e.target.value} : null
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editingContact?.notes || ''}
                onChange={(e) => setEditingContact(prev => 
                  prev ? {...prev, notes: e.target.value} : null
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (editingContact) {
                handleUpdate(editingContact)
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Message to {editingContact?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Related Case</Label>
              <Select
                value={selectedCaseId}
                onValueChange={setSelectedCaseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {availableCases.map((case_) => (
                    <SelectItem key={case_.id} value={case_.id.toString()}>
                      {case_.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageDialog(false)
                setMessageText("")
                setSelectedCaseId("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contactId: editingContact?.id,
                      message: messageText,
                      caseId: selectedCaseId ? parseInt(selectedCaseId) : null,
                    }),
                  })

                  if (!response.ok) throw new Error('Failed to send message')

                  toast({
                    title: "Message Sent",
                    description: `Message sent to ${editingContact?.name}`,
                  })
                  setShowMessageDialog(false)
                  setMessageText("")
                  setSelectedCaseId("")
                } catch (error) {
                  console.error('Error sending message:', error)
                  toast({
                    title: "Error",
                    description: "Failed to send message",
                    variant: "destructive",
                  })
                }
              }}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

