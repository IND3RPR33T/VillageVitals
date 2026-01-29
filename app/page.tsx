"use client";
import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import IntroVideo from "@/components/IntroVideo";
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Users, Activity, Droplets, AlertTriangle, BookOpen, Mail, Phone } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

import Hyperspeed from "@/components/Hyperspeed/Hyperspeed"
import GradientText from "@/components/GradientText/GradientText"
import ShinyText from "@/components/ShinyText/ShinyText"
import StarBorder from "@/components/StarBorder/StarBorder"
import { GlareCard } from "@/components/ui/glare-card"
import GetStartedButton from "@/components/GetStartedButton"
import { FloatingNav } from "@/components/ui/floating-navbar"


export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="min-h-screen relative">
      <AnimatePresence>
        {showIntro && <IntroVideo onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && (
        <>
          <Hyperspeed
            effectOptions={{
              distortion: 'turbulentDistortion',
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 3,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 20,
              lightPairsPerRoadWay: 40,
              shoulderLinesWidthPercentage: 0.05,
              brokenLinesWidthPercentage: 0.1,
              brokenLinesLengthPercentage: 0.5,
              lightStickWidth: [0.12, 0.5],
              lightStickHeight: [1.3, 1.7],
              movingAwaySpeed: [60, 80],
              movingCloserSpeed: [-120, -160],
              carLightsLength: [400 * 0.03, 400 * 0.2],
              carLightsRadius: [0.05, 0.14],
              carWidthPercentage: [0.3, 0.5],
              carShiftX: [-0.8, 0.8],
              carFloorSeparation: [0, 5],
              colors: {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0x131318,
                brokenLines: 0x131318,
                leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                sticks: 0x03b3c3
              },
            }}
          />

          {/* Floating Navbar */}
          <FloatingNav
            navItems={[
              { name: "Features", link: "#features" },
              { name: "About", link: "#about" },
              { name: "Contact", link: "#contact" },
              { name: "Get Started", link: "/login" },
            ]}
          />

          {/* Hero Section */}
          <section className="min-h-[100vh] flex flex-col justify-center py-20 px-4 relative z-10 bg-transparent">
            <div className="container mx-auto text-center bg-transparent">
              <div className="animate-fade-in">
                <Badge variant="secondary" className="mb-4">
                  Empowering Rural Healthcare
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 text-white drop-shadow-md">
                  <GradientText className="inline-flex">Comprehensive Health Monitoring for Rural Communities</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto drop-shadow-sm">
                  <ShinyText text="JanArogya connects rural communities with essential health monitoring tools, water quality tracking, and medical resources to ensure better health outcomes for all." disabled={false} speed={3} className="inline-flex" />
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/login" className="animate-slide-up">
                    <GetStartedButton text="Start Monitoring" />
                  </Link>
                  <Button size="lg" variant="outline" asChild className="animate-slide-up bg-transparent">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 bg-transparent backdrop-blur-md relative z-10">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <GradientText>Complete Health Ecosystem</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                  <ShinyText text="From health reporting to water quality monitoring, we provide all the tools needed for comprehensive community health management." disabled={false} speed={3} />
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-transparent backdrop-blur-sm border-primary/20 min-h-[300apx]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Health Reporting" disabled={false} speed={3} /></CardTitle>
                      <CardDescription>
                        <ShinyText text="Easy-to-use forms for reporting health cases and symptoms in your community" disabled={false} speed={3} />
                      </CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>

                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-card/90 backdrop-blur-sm min-h-[300px]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Droplets className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Water Quality Monitoring" disabled={false} speed={3} /></CardTitle>
                      <CardDescription>
                        <ShinyText text="Track water quality metrics with visual risk indicators and contamination alerts" disabled={false} speed={3} />
                      </CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>

                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-card/90 backdrop-blur-sm min-h-[300px]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Interactive Health Map" disabled={false} speed={3} /></CardTitle>
                      <CardDescription>
                        <ShinyText text="Visualize health data and unsafe water sources with color-coded severity indicators" disabled={false} speed={3} />
                      </CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>

                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-card/90 backdrop-blur-sm min-h-[300px]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Alert Management" disabled={false} speed={3} /></CardTitle>
                      <CardDescription><ShinyText text="Create and broadcast health alerts with SMS and email integration" disabled={false} speed={3} /></CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>

                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-card/90 backdrop-blur-sm min-h-[300px]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Community Dashboard" disabled={false} speed={3} /></CardTitle>
                      <CardDescription>
                        <ShinyText text="View health trends and data from nearby villages with interactive charts" disabled={false} speed={3} />
                      </CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>

                <StarBorder as="div" className="animate-slide-up hover:shadow-lg transition-shadow bg-card/90 backdrop-blur-sm min-h-[300px]" color="magenta" speed="2s" thickness={5}>
                  <GlareCard>
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle><ShinyText text="Educational Resources" disabled={false} speed={3} /></CardTitle>
                      <CardDescription>
                        <ShinyText text="Access health education materials in multiple languages with offline support" disabled={false} speed={3} />
                      </CardDescription>
                    </CardHeader>
                  </GlareCard>
                </StarBorder>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 bg-transparent backdrop-blur-sm relative z-10">
            <div className="container mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="animate-fade-in">
                  <div className="text-4xl font-bold text-primary mb-2"><ShinyText text="200+" disabled={false} speed={3} /></div>
                  <div className="text-muted-foreground"><ShinyText text="Villages Connected" disabled={false} speed={3} /></div>
                </div>
                <div className="animate-fade-in">
                  <div className="text-4xl font-bold text-primary mb-2"><ShinyText text="1000+" disabled={false} speed={3} /></div>
                  <div className="text-muted-foreground"><ShinyText text="Health Reports Submitted" disabled={false} speed={3} /></div>
                </div>
                <div className="animate-fade-in">
                  <div className="text-4xl font-bold text-primary mb-2"><ShinyText text="24/7" disabled={false} speed={3} /></div>
                  <div className="text-muted-foreground"><ShinyText text="Monitoring & Alerts" disabled={false} speed={3} /></div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-transparent text-primary-foreground relative z-10">
            <div className="container mx-auto text-center">
              <GradientText colors={["#5227FF", "#FF9FFC", "#B19EEF"]} animationSpeed={8} showBorder={false} className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Transform Rural Healthcare?</GradientText>
              <p className="text-xl mb-8 text-balance max-w-2xl mx-auto opacity-90">
                <ShinyText text="Join thousands of health workers and community members using JanArogya to improve health outcomes in rural areas." disabled={false} speed={3} />
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Get Started Today</Link>
              </Button>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 px-4 bg-transparent backdrop-blur-md relative z-10">
            <div className="container mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-2"><ShinyText text="Contact Us" disabled={false} speed={3} /></h2>
                <p className="text-muted-foreground"><ShinyText text="We’re here to help. Reach us anytime." disabled={false} speed={3} /></p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                <StarBorder as="div" className="bg-transparent backdrop-blur-sm border-primary/20" color="magenta" speed="2s" thickness={3}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle><ShinyText text="Email" disabled={false} speed={3} /></CardTitle>
                        <CardDescription><ShinyText text="For general support and inquiries" disabled={false} speed={3} /></CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <a href="mailto:support@villagevitals.org" className="text-primary hover:underline">
                      support@janarogya.org
                    </a>
                  </div>
                </StarBorder>

                <StarBorder as="div" className="bg-card/90 backdrop-blur-sm" color="magenta" speed="2s" thickness={3}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle><ShinyText text="Phone" disabled={false} speed={3} /></CardTitle>
                        <CardDescription><ShinyText text="Toll-free support line" disabled={false} speed={3} /></CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <a href="tel:1800459211" className="text-primary hover:underline">
                      1800-459-211
                    </a>
                  </div>
                </StarBorder>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 border-t bg-transparent backdrop-blur-md relative z-10">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <Logo size="md" />
                <div className="text-sm text-muted-foreground">© 2025 JanArogya. Empowering rural healthcare.</div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
