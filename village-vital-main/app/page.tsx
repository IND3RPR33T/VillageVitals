import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Users, Activity, Droplets, AlertTriangle, BookOpen, Mail, Phone } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              Empowering Rural Healthcare
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Comprehensive Health Monitoring for <span className="text-primary">Rural Communities</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto">
              VillageVitals connects rural communities with essential health monitoring tools, water quality tracking,
              and medical resources to ensure better health outcomes for all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="animate-slide-up">
                <Link href="/login">Start Monitoring</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="animate-slide-up bg-transparent">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Health Ecosystem</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              From health reporting to water quality monitoring, we provide all the tools needed for comprehensive
              community health management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Health Reporting</CardTitle>
                <CardDescription>
                  Easy-to-use forms for reporting health cases and symptoms in your community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Water Quality Monitoring</CardTitle>
                <CardDescription>
                  Track water quality metrics with visual risk indicators and contamination alerts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Interactive Health Map</CardTitle>
                <CardDescription>
                  Visualize health data and unsafe water sources with color-coded severity indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Alert Management</CardTitle>
                <CardDescription>Create and broadcast health alerts with SMS and email integration</CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Community Dashboard</CardTitle>
                <CardDescription>
                  View health trends and data from nearby villages with interactive charts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="animate-slide-up hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>
                  Access health education materials in multiple languages with offline support
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Villages Connected</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Health Reports Submitted</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Monitoring & Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Transform Rural Healthcare?</h2>
          <p className="text-xl mb-8 text-balance max-w-2xl mx-auto opacity-90">
            Join thousands of health workers and community members using VillageVitals to improve health outcomes in
            rural areas.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h2>
            <p className="text-muted-foreground">We’re here to help. Reach us anytime.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Email</CardTitle>
                    <CardDescription>For general support and inquiries</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="px-6 pb-6">
                <a href="mailto:support@villagevitals.org" className="text-primary hover:underline">
                  support@villagevitals.org
                </a>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Phone</CardTitle>
                    <CardDescription>Toll-free support line</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="px-6 pb-6">
                <a href="tel:1800459211" className="text-primary hover:underline">
                  1800-459-211
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo size="md" />
            <div className="text-sm text-muted-foreground">© 2025 VillageVitals. Empowering rural healthcare.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
