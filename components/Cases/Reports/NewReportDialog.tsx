"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import type { ReportTemplate, ReportVariable } from "@/lib/db/types/reports"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const reportSchema = z.object({
  templateId: z.number(),
  format: z.enum(['html', 'pdf']),
  options: z.object({
    coverPage: z.object({
      enabled: z.boolean(),
      includeLogo: z.boolean(),
    }),
    tableOfContents: z.boolean(),
    caseSummary: z.object({
      enabled: z.boolean(),
      includeMyInfo: z.boolean(),
      includeClientInfo: z.boolean(),
      includeCaseDescription: z.boolean(),
      customSummary: z.string().optional(),
    }),
    evidence: z.object({
      enabled: z.boolean(),
      includeChainOfCustody: z.boolean(),
      includeHashes: z.boolean(),
      includeMetadata: z.boolean(),
      hashes: z.object({
        md5: z.boolean(),
        sha1: z.boolean(),
        sha256: z.boolean(),
        sha512: z.boolean()
      })
    }),
    activities: z.object({
      enabled: z.boolean(),
      includePrivate: z.boolean(),
    }),
    notes: z.object({
      enabled: z.boolean(),
      includePrivate: z.boolean(),
    }),
    signature: z.object({
      enabled: z.boolean(),
      includeDigitalSignature: z.boolean(),
      includeTitle: z.boolean(),
      includeOrganization: z.boolean(),
      includeContact: z.boolean(),
      typedSignature: z.string().optional(),
    }),
  }),
  variables: z.record(z.any()),
})

type FormValues = z.infer<typeof reportSchema>

interface NewReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: number
  onSuccess: () => void
}

export function NewReportDialog({
  open,
  onOpenChange,
  caseId,
  onSuccess,
}: NewReportDialogProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      format: 'html',
      options: {
        coverPage: {
          enabled: true,
          includeLogo: true,
        },
        tableOfContents: true,
        caseSummary: {
          enabled: true,
          includeMyInfo: true,
          includeClientInfo: true,
          includeCaseDescription: true,
          customSummary: '',
        },
        evidence: {
          enabled: true,
          includeChainOfCustody: true,
          includeHashes: true,
          includeMetadata: true,
          hashes: {
            md5: true,
            sha1: false,
            sha256: true,
            sha512: false
          }
        },
        activities: {
          enabled: true,
          includePrivate: false,
        },
        notes: {
          enabled: true,
          includePrivate: false,
        },
        signature: {
          enabled: true,
          includeDigitalSignature: false,
          includeTitle: true,
          includeOrganization: true,
          includeContact: false,
          typedSignature: '',
        },
      },
      variables: {},
    }
  })

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/reports/templates")
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          templateId: data.templateId,
          format: data.format,
          options: data.options,
          variables: data.variables,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate report")

      onSuccess()
      onOpenChange(false)
      toast({
        title: "Success",
        description: "Report generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Selection */}
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Report Options */}
            <div className="space-y-4">
              <h3 className="font-medium">Report Options</h3>
              <Accordion type="multiple" defaultValue={["cover-page", "case-summary", "evidence"]}>
                <ReportSection
                  form={form}
                  title="Cover Page"
                  basePath="options.coverPage"
                  options={[
                    { key: "enabled", label: "Include Cover Page" },
                    { key: "includeLogo", label: "Include Organization Logo" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Case Summary"
                  basePath="options.caseSummary"
                  options={[
                    { key: "enabled", label: "Include Case Summary" },
                    { key: "includeMyInfo", label: "Include My Information" },
                    { key: "includeClientInfo", label: "Include Client Information" },
                    { key: "includeCaseDescription", label: "Include Case Description" },
                  ]}
                  customFields={[
                    {
                      key: "customSummary",
                      label: "Custom Summary",
                      type: "textarea",
                      description: "Add any additional information to include in the summary",
                    },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Evidence Details"
                  basePath="options.evidence"
                  options={[
                    { key: "enabled", label: "Include Evidence" },
                    { key: "includeChainOfCustody", label: "Include Chain of Custody" },
                    { key: "includeHashes", label: "Include File Hashes" },
                    { key: "includeMetadata", label: "Include Metadata" },
                    { key: "hashes.md5", label: "Include MD5 Hash" },
                    { key: "hashes.sha1", label: "Include SHA1 Hash" },
                    { key: "hashes.sha256", label: "Include SHA256 Hash" },
                    { key: "hashes.sha512", label: "Include SHA512 Hash" },
                  ]}
                  customFields={[
                    {
                      key: "dateRange",
                      label: "Date Range",
                      type: "input",
                      description: "Only include evidence from this date range"
                    }
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Activities"
                  basePath="options.activities"
                  options={[
                    { key: "enabled", label: "Include Activities" },
                    { key: "includePrivate", label: "Include Private Activities" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Notes"
                  basePath="options.notes"
                  options={[
                    { key: "enabled", label: "Include Notes" },
                    { key: "includePrivate", label: "Include Private Notes" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Signature"
                  basePath="options.signature"
                  options={[
                    { key: "enabled", label: "Include Signature Section" },
                    { key: "includeTitle", label: "Include Title" },
                    { key: "includeOrganization", label: "Include Organization" },
                    { key: "includeContact", label: "Include Contact Information" }
                  ]}
                  customFields={[
                    {
                      key: "typedSignature",
                      label: "Signature",
                      type: "input",
                      description: "Type your name as your signature"
                    }
                  ]}
                />
              </Accordion>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface ReportSectionProps {
  form: any
  title: string
  basePath: string
  options: Array<{ key: string; label: string }>
  customFields?: Array<{
    key: string
    label: string
    type: "input" | "textarea"
    description?: string
  }>
}

function ReportSection({ form, title, basePath, options, customFields }: ReportSectionProps) {
  const enabled = form.watch(`${basePath}.enabled`)

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`${basePath}.enabled`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 m-0">
                <FormControl onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0 font-medium text-sm">{title}</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 pt-2">
        {enabled && (
          <>
            {options.filter(opt => opt.key !== 'enabled').map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={`${basePath}.${key}`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 ml-6">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">{label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}

            {customFields?.map(({ key, label, type, description }) => (
              <FormField
                key={key}
                control={form.control}
                name={`${basePath}.${key}`}
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      {type === "textarea" ? (
                        <Textarea {...field} placeholder={description} />
                      ) : (
                        <Input {...field} placeholder={description} />
                      )}
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                  </FormItem>
                )}
              />
            ))}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

