"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEvidenceTypes } from "./use-evidence-types";
import { FileUpload } from "./FileUpload";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  evidenceNumber: z.string().optional(),
  type_id: z.string().optional(),
  location: z.string().optional(),
  storageLocation: z.string().optional(),
  md5Hash: z.string().optional(),
  sha256Hash: z.string().optional(),
  acquisitionDate: z.string().optional(),
  size: z.string().optional(),
  filePath: z.string().optional(),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewEvidenceDialogProps {
  caseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEvidenceCreated?: () => void;
}

interface FormFieldProps {
  field: ControllerRenderProps<FormValues, keyof FormValues>;
}

export function NewEvidenceDialog({
  caseId,
  open,
  onOpenChange,
  onEvidenceCreated,
}: NewEvidenceDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { types, loading: typesLoading, error: typesError } = useEvidenceTypes();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      evidenceNumber: "",
      type_id: "",
      location: "",
      storageLocation: "",
      md5Hash: "",
      sha256Hash: "",
      acquisitionDate: "",
      size: "",
      filePath: "",
      originalName: "",
      mimeType: "",
    },
  });

  const handleUploadComplete = (fileData: {
    fileName: string;
    originalName: string;
    size: number;
    md5: string;
    sha256: string;
    path: string;
    mimeType?: string;
  }) => {
    form.setValue("name", fileData.originalName);
    form.setValue("size", fileData.size.toString());
    form.setValue("md5Hash", fileData.md5);
    form.setValue("sha256Hash", fileData.sha256);
    form.setValue("filePath", fileData.path);
    form.setValue("originalName", fileData.originalName);
    form.setValue("mimeType", fileData.mimeType || "");

    // Auto-generate evidence number if not set
    if (!form.getValues("evidenceNumber")) {
      form.setValue("evidenceNumber", `EV-${Date.now()}`);
    }

    toast({
      title: "File Upload Complete",
      description: `${fileData.originalName} uploaded successfully`,
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Ensure we have required fields
      if (!values.type_id) {
        toast({
          title: "Error",
          description: "Please select an evidence type",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          case_id: caseId,
          evidenceNumber: values.evidenceNumber || `EV-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create evidence");
      }

      toast({
        title: "Success",
        description: "Evidence created successfully",
      });

      form.reset();
      onOpenChange(false);
      onEvidenceCreated?.();
    } catch (error) {
      console.error("[NEW_EVIDENCE_DIALOG]", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create evidence",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Evidence</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evidenceNumber"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Evidence Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-generated if empty" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_id"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={typesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={typesLoading ? "Loading..." : "Select type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typesError ? (
                          <SelectItem value="error" disabled>
                            Error loading types
                          </SelectItem>
                        ) : types.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No types available
                          </SelectItem>
                        ) : (
                          types.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {typesError && (
                      <p className="text-sm text-destructive">{typesError.message}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageLocation"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisitionDate"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Acquisition Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>Size (bytes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }: FormFieldProps) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="md5Hash"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>MD5 Hash</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sha256Hash"
                render={({ field }: FormFieldProps) => (
                  <FormItem>
                    <FormLabel>SHA256 Hash</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || typesLoading}>
                {loading ? "Creating..." : "Create Evidence"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
