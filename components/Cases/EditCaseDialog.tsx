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
import { Pencil } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import type { CaseWithRelations } from "@/lib/db/types"
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers"
import { CASE_CATEGORIES, CASE_CATEGORY_LIST } from "@/lib/constants/caseTypes"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, "Case number is required"),
  caseDate: z.string().optional(),
  caseCategory: z.string(),
  caseType: z.string().optional(),
  status: z.string(),
  description: z.string().optional(),
  casePriority: z.string().optional(),
  caseAssignee: z.string().optional(),
  caseExaminer: z.string().optional(),
  caseInvestigator: z.string().optional(),
  organizationName: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditCaseDialogProps {
  caseData: CaseWithRelations;
  onCaseUpdated?: (data: Partial<CaseWithRelations>) => void;
}

export function EditCaseDialog({ caseData, onCaseUpdated }: EditCaseDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { orgUsers, isLoading, getUserDisplayName } = useOrganizationUsers()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: caseData.name,
      caseDate: caseData.caseDate ? new Date(caseData.caseDate).toISOString().split('T')[0] : "",
      caseCategory: caseData.caseCategory || "",
      caseType: caseData.caseType || "",
      status: caseData.status,
      description: caseData.description || "",
      casePriority: caseData.casePriority || "",
      caseAssignee: caseData.caseAssignee || "",
      caseExaminer: caseData.caseExaminer || "",
      caseInvestigator: caseData.caseInvestigator || "",
      organizationName: caseData.organizationName || "",
    }
  })

  const selectedCategory = form.watch("caseCategory")

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/cases/${caseData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update case")
      }

      const updatedCase = await response.json()
      
      toast({
        title: "Success",
        description: "Case updated successfully",
      })

      setOpen(false)
      onCaseUpdated?.(updatedCase)
    } catch (error) {
      console.error('Error updating case:', error)
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number*</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" />
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
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
