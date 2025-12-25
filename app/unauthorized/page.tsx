import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact your administrator if you believe this is an
            error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/login">Sign In with Different Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
