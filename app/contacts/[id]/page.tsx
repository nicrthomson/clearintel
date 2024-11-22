import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Mail, Phone, Building2, Paperclip } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MessageForm } from "./message-form"

async function getContact(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(id) },
    include: {
      messages: {
        include: { case: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  return contact
}

export default async function ContactPage({ params }: { params: { id: string } }) {
  const contact = await getContact(params.id)
  if (!contact) notFound()

  return (
    <Tabs defaultValue="messages" className="flex h-[calc(100vh-4rem)]">
      <div className="flex flex-col flex-1">
        <header className="border-b px-4 py-2 flex items-center gap-3 h-14">
          <Link href="/contacts">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-sm font-semibold leading-none">{contact.name}</h1>
            <p className="text-xs text-muted-foreground">{contact.organization || 'No organization'}</p>
          </div>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
        </header>

        <div className="flex-1 flex">
          <TabsContent value="messages" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {contact.messages.length > 0 ? (
                  contact.messages.map((message) => (
                    <div key={message.id} className="flex gap-2 max-w-[80%]">
                      <Avatar className="h-7 w-7 mt-0.5">
                        <AvatarFallback className="text-xs">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-sm">{message.message}</p>
                          {message.attachments && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {(message.attachments as any[]).map((attachment, index) => (
                                <div
                                  key={index}
                                  className="text-xs bg-muted/50 px-2 py-1 rounded flex items-center gap-1"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.filename}</span>
                                  <span className="text-muted-foreground">
                                    ({Math.round(attachment.size / 1024)}KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                          </span>
                          {message.case && (
                            <Link 
                              href={`/cases/${message.case.id}`}
                              className="text-[10px] text-blue-500 hover:underline"
                            >
                              Case: {message.case.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    No messages yet
                  </p>
                )}
              </div>
            </ScrollArea>
            <MessageForm contactId={contact.id} />
          </TabsContent>

          <TabsContent value="details" className="m-0 p-4 flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contact.organization || 'No organization'}</span>
              </div>
              {contact.notes && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{contact.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  )
}