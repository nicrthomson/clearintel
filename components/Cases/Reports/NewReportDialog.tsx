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
      includeStorageLocation: z.boolean(),
      includeAcquisitionDate: z.boolean(),
      includeChainOfCustody: z.boolean(),
      includeMD5: z.boolean(),
      includeSHA256: z.boolean(),
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
    executiveSummary: z.object({
      enabled: z.boolean(),
      content: z.string().optional(),
    }),
    timeline: z.object({
      enabled: z.boolean(),
      includeActivities: z.boolean(),
      includeEvidence: z.boolean(),
      includeNotes: z.boolean(),
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      }).optional(),
    }),
    methodology: z.object({
      enabled: z.boolean(),
      content: z.string().optional(),
    }),
    equipment: z.object({
      enabled: z.boolean(),
      includeTools: z.boolean(),
      includeVersions: z.boolean(),
    }),
    relatedCases: z.object({
      enabled: z.boolean(),
      includeDescription: z.boolean(),
    }),
    header: z.object({
      enabled: z.boolean(),
      customText: z.string().optional(),
      includePageNumbers: z.boolean(),
      includeLogo: z.boolean(),
    }),
    footer: z.object({
      enabled: z.boolean(), 
      customText: z.string().optional(),
      includePageNumbers: z.boolean(),
      includeDisclaimer: z.boolean(),
    }),
  }),
  variables: z.record(z.any()),
  documentProperties: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    subject: z.string().optional(),
    keywords: z.string().optional(),
    confidential: z.boolean(),
    draft: z.boolean(),
  }),
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
          includeStorageLocation: true,
          includeAcquisitionDate: true,
          includeChainOfCustody: true,
          includeMD5: true,
          includeSHA256: false,
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
        executiveSummary: {
          enabled: true,
          content: '',
        },
        timeline: {
          enabled: true,
          includeActivities: true,
          includeEvidence: true,
          includeNotes: true,
          dateRange: {
            start: '',
            end: '',
          },
        },
        methodology: {
          enabled: true,
          content: '',
        },
        equipment: {
          enabled: true,
          includeTools: true,
          includeVersions: true,
        },
        relatedCases: {
          enabled: true,
          includeDescription: true,
        },
        header: {
          enabled: true,
          customText: '',
          includePageNumbers: true,
          includeLogo: true,
        },
        footer: {
          enabled: true,
          customText: '',
          includePageNumbers: true,
          includeDisclaimer: true,
        },
      },
      variables: {},
      documentProperties: {
        title: '',
        author: '',
        subject: '',
        keywords: '',
        confidential: false,
        draft: false,
      },
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
              <Accordion type="multiple" defaultValue={["document-properties", "header", "case-summary"]}>
                <ReportSection
                  form={form}
                  title="Document Properties"
                  basePath="documentProperties"
                  options={[
                    { key: "confidential", label: "Mark as Confidential" },
                    { key: "draft", label: "Mark as Draft" },
                  ]}
                  customFields={[
                    { key: "title", label: "Document Title", type: "input" },
                    { key: "author", label: "Author", type: "input" },
                    { key: "subject", label: "Subject", type: "input" },
                    { key: "keywords", label: "Keywords", type: "input" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Header & Footer"
                  basePath="options.header"
                  options={[
                    { key: "enabled", label: "Include Header" },
                    { key: "includeLogo", label: "Use Organization Logo" },
                    { key: "includePageNumbers", label: "Show Page Numbers" },
                  ]}
                  customFields={[
                    { key: "customText", label: "Custom Header Text", type: "textarea" },
                  ]}
                />

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
                  title="Executive Summary"
                  basePath="options.executiveSummary"
                  options={[
                    { key: "enabled", label: "Include Executive Summary" },
                  ]}
                  customFields={[
                    {
                      key: "content",
                      label: "Summary Content",
                      type: "textarea",
                      description: "Provide an executive summary of the case",
                    },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Case Summary"
                  basePath="options.caseSummary"
                  options={[
                    { key: "enabled", label: "Include Case Summary" },
                    { key: "includeMyInfo", label: "Include Examiner Information" },
                    { key: "includeClientInfo", label: "Include Client Information" },
                    { key: "includeCaseDescription", label: "Include Case Description" },
                  ]}
                  customFields={[
                    {
                      key: "customSummary",
                      label: "Additional Notes",
                      type: "textarea",
                    },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Evidence"
                  basePath="options.evidence"
                  options={[
                    { key: "enabled", label: "Include Evidence" },
                    { key: "includeStorageLocation", label: "Include Storage Location" },
                    { key: "includeAcquisitionDate", label: "Include Date Acquired" },
                    { key: "includeChainOfCustody", label: "Include Chain of Custody" },
                    { key: "includeMD5", label: "Include MD5 Hash" },
                    { key: "includeSHA256", label: "Include SHA256 Hash" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Timeline"
                  basePath="options.timeline"
                  options={[
                    { key: "enabled", label: "Include Timeline" },
                    { key: "includeActivities", label: "Include Activities" },
                    { key: "includeEvidence", label: "Include Evidence" },
                    { key: "includeNotes", label: "Include Notes" },
                  ]}
                  customFields={[
                    {
                      key: "dateRange.start",
                      label: "Start Date",
                      type: "input",
                      description: "Start date for timeline (YYYY-MM-DD)",
                    },
                    {
                      key: "dateRange.end",
                      label: "End Date",
                      type: "input",
                      description: "End date for timeline (YYYY-MM-DD)",
                    },
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
                  title="Methodology"
                  basePath="options.methodology"
                  options={[
                    { key: "enabled", label: "Include Methodology" },
                  ]}
                  customFields={[
                    {
                      key: "content",
                      label: "Methodology Description",
                      type: "textarea",
                      description: "Describe the methodology used in this investigation",
                    },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Equipment & Tools"
                  basePath="options.equipment"
                  options={[
                    { key: "enabled", label: "Include Equipment Section" },
                    { key: "includeTools", label: "Include Software Tools" },
                    { key: "includeVersions", label: "Include Version Information" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Related Cases"
                  basePath="options.relatedCases"
                  options={[
                    { key: "enabled", label: "Include Related Cases" },
                    { key: "includeDescription", label: "Include Case Descriptions" },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Signature"
                  basePath="options.signature"
                  options={[
                    { key: "enabled", label: "Include Signature Section" },
                    { key: "includeDigitalSignature", label: "Include Digital Signature" },
                    { key: "includeTitle", label: "Include Title" },
                    { key: "includeOrganization", label: "Include Organization" },
                    { key: "includeContact", label: "Include Contact Information" },
                  ]}
                  customFields={[
                    {
                      key: "typedSignature",
                      label: "Typed Signature",
                      type: "input",
                      description: "Type your name as your signature",
                    },
                  ]}
                />

                <ReportSection
                  form={form}
                  title="Case Notes"
                  basePath="options.notes"
                  options={[
                    { key: "enabled", label: "Include Case Notes" },
                    { key: "includeAuthor", label: "Include Note Author" },
                    { key: "includeTimestamp", label: "Include Note Timestamp" },
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

