import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatBytes, formatDate } from "@/lib/utils"
import { Eye, Plus } from "lucide-react"
import NewImageDialog from "./NewImageDialog"
import { useState } from "react"
import Link from "next/link"

interface ForensicImage {
  id: number
  name: string
  description: string | null
  imageType: string
  symlinkPath: string
  size: number
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface ImagesTableProps {
  caseId: number
  images: ForensicImage[]
  mutate: () => void
}

export default function ImagesTable({ caseId, images, mutate }: ImagesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Forensic Images</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No forensic images added yet
              </TableCell>
            </TableRow>
          ) : (
            images.map((image) => (
              <TableRow key={image.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{image.name}</div>
                    {image.description && (
                      <div className="text-sm text-muted-foreground">
                        {image.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{image.imageType}</TableCell>
                <TableCell>{formatBytes(image.size)}</TableCell>
                <TableCell>{image.user.name || image.user.email}</TableCell>
                <TableCell>{formatDate(image.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/case/${caseId}/images/${image.id}`}>
                    <Button variant="ghost" size="icon" title="View Image">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <NewImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        caseId={caseId}
        onSuccess={() => {
          setDialogOpen(false)
          mutate()
        }}
      />
    </div>
  )
}
