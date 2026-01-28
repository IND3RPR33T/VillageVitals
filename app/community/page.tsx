"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Megaphone, Send } from "lucide-react"

export default function CommunityPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Announcements and local discussions</p>
          </div>

          <Tabs defaultValue="announcements" className="w-full">
            <TabsList>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="announcements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/> Latest Announcements</CardTitle>
                  <CardDescription>Village-wide notices and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="p-3 border rounded-md flex items-start justify-between">
                      <div>
                        <p className="font-medium">Water supply maintenance on Sunday</p>
                        <p className="text-sm text-muted-foreground">Temporary outage 6–9 AM; please store water in advance.</p>
                      </div>
                      <Badge>Water</Badge>
                    </li>
                    <li className="p-3 border rounded-md flex items-start justify-between">
                      <div>
                        <p className="font-medium">Free health camp this Saturday</p>
                        <p className="text-sm text-muted-foreground">Basic checkups and ORS distribution at the community hall.</p>
                      </div>
                      <Badge variant="secondary">Health</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Discussions</CardTitle>
                  <CardDescription>Share tips and ask questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm"><span className="font-medium">Sita:</span> Any tips for safe storage during the maintenance?</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm"><span className="font-medium">Raju:</span> We boil water and keep in covered steel containers.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input placeholder="Write a message..." aria-label="Message input"/>
                      <Button size="sm"><Send className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
