import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SoftwareLicenses } from "@/components/Lab/SoftwareLicenses"
import { Equipment } from "@/components/Lab/Equipment"

export default function LabPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Lab Management</h1>

      <Tabs defaultValue="software" className="space-y-4">
        <TabsList>
          <TabsTrigger value="software">Software Licenses</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        <TabsContent value="software">
          <SoftwareLicenses />
        </TabsContent>
        <TabsContent value="equipment">
          <Equipment />
        </TabsContent>
      </Tabs>
    </div>
  )
}
