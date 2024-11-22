"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useSession } from "next-auth/react"
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers"
import { CASE_CATEGORIES, CASE_CATEGORY_LIST } from "@/lib/constants/caseTypes"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, "Case number is required"),
  caseDate: z.string().optional(),
  caseCategory: z.string(),
  caseType: z.string().optional(),
  caseStatus: z.string().default("Open"),
  description: z.string().optional(),
  casePriority: z.string().optional(),
  caseAssignee: z.string().optional(),
  caseExaminer: z.string().optional(),
  caseInvestigator: z.string().optional(),
  organization: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewCaseDialogProps {
  onCaseCreated: () => void
}

export function NewCaseDialog({ onCaseCreated }: NewCaseDialogProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const { orgUsers, isLoading, getUserDisplayName } = useOrganizationUsers()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      caseDate: "",
      caseCategory: "",
      caseType: "",
      caseStatus: "Open",
      description: "",
      casePriority: "",
      caseAssignee: orgUsers?.currentUser?.name || "",
      caseExaminer: "",
      caseInvestigator: "",
      organization: ""
    }
  })

  const selectedCategory = form.watch("caseCategory")

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session) {
        setError("You must be logged in to create a case")
        return
      }

      // Ensure both category and type are sent
      const submitData = {
        ...data,
        caseCategory: data.caseCategory,  // Explicitly include category
        caseType: data.caseType || null,  // Include type if selected
      }

      console.log('Submitting case data:', submitData)
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      console.log('Server response:', result)

      if (!response.ok) {
        setError(result.error || "Failed to create case")
        return
      }

      form.reset()
      setOpen(false)
      onCaseCreated()
    } catch (error) {
      console.error('Error creating case:', error)
      setError("An error occurred. Please try again.")
    }
  }

  if (!session) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="text-sm text-destructive text-center">{error}</div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MF-99-2500" className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="caseCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue("caseType", "") // Reset case type when category changes
                          }}
                        >
                          <SelectTrigger className={cn(
                            "w-full",
                            !field.value && "text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CASE_CATEGORY_LIST.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger className={cn(
                            "w-full",
                            !field.value && "text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory && CASE_CATEGORIES[selectedCategory as keyof typeof CASE_CATEGORIES]?.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="casePriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={cn(
                            "w-full",
                            !field.value && "text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caseAssignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger className={cn(
                            "w-full",
                            !field.value && "text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseExaminer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Examiner</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger className={cn(
                            "w-full",
                            !field.value && "text-muted-foreground"
                          )}>
                            <SelectValue placeholder="Select examiner" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="caseInvestigator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investigator</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          !field.value && "text-muted-foreground"
                        )}>
                          <SelectValue placeholder="Select investigator" />
                        </SelectTrigger>
                        <SelectContent>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} className="resize-none" placeholder="Case description..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Case"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
