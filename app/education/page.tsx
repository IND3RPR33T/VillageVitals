"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, PlayCircle, Info, Droplet, Flame, Filter, ShieldCheck, Package, AlertTriangle, Thermometer, Activity } from "lucide-react"

const guides = [
  {
    id: 1,
    title_en: "Boiling and Filtering Water at Home",
    title_hi: "घर पर पानी उबालना और फिल्टर करना",
    content_en: "Learn simple steps to ensure safe drinking water using boiling and basic filtration.",
    content_hi: "उबालने और बेसिक फिल्ट्रेशन का उपयोग करके सुरक्षित पीने का पानी कैसे सुनिश्चित करें।",
  },
  {
    id: 2,
    title_en: "Recognizing Early Symptoms",
    title_hi: "प्रारंभिक लक्षण पहचानें",
    content_en: "Identify early signs of water-borne diseases like diarrhea, vomiting, and fever.",
    content_hi: "डायरिया, उल्टी और बुखार जैसे जलजनित रोगों के प्रारंभिक लक्षण पहचानें।",
  },
  {
    id: 3,
    title_en: "Household Hygiene Checklist",
    title_hi: "घरेलू स्वच्छता चेकलिस्ट",
    content_en: "Daily habits to reduce risk: handwashing, safe storage, clean utensils.",
    content_hi: "जोखिम कम करने की दैनिक आदतें: हाथ धोना, सुरक्षित भंडारण, साफ बर्तन।",
  },
]

const videos = [
  {
    id: 1,
    title_en: "Handwashing Basics (WHO)",
    title_hi: "हैंडवॉशिंग के मूल (WHO)",
    embed: "https://www.youtube.com/embed/3PmVJQUCm4E",
    watch: "https://www.youtube.com/watch?v=3PmVJQUCm4E",
    thumb: "https://i.ytimg.com/vi/3PmVJQUCm4E/hqdefault.jpg",
  },
  {
    id: 2,
    title_en: "Safe Water Storage at Home",
    title_hi: "घर में सुरक्षित जल भंडारण",
    embed: "https://www.youtube.com/embed/4gRX5nYBbLI",
    watch: "https://www.youtube.com/watch?v=4gRX5nYBbLI",
    thumb: "https://i.ytimg.com/vi/4gRX5nYBbLI/hqdefault.jpg",
  },
]

const infographics = [
  {
    id: 1,
    title_en: "Water Purification Steps",
    title_hi: "जल शुद्धिकरण के चरण",
    img: "https://silverinstitute.opt-wp.cloud.bosslogics.com/wp-content/uploads/2017/06/silverinwaterpurification-1024x683.jpg",
    steps_en: [
      "Collect water in a clean container.",
      "Boil water for at least 1–3 minutes.",
      "Let it cool covered to avoid re-contamination.",
      "Filter through a clean cloth or certified filter.",
      "Store in a covered, clean container with a ladle.",
    ],
    steps_hi: [
      "साफ कंटेनर में पानी इकट्ठा करें।",
      "पानी को कम से कम 1–3 मिनट तक उबालें।",
      "ढककर ठंडा होने दें ताकि दोबारा गंदगी न मिले।",
      "साफ कपड़े या प्रमाणित फ़िल्टर से छानें।",
      "ढक्कन वाले साफ बर्तन में रखें और कलछी से निकालें।",
    ],
  },
  {
    id: 2,
    title_en: "Diseases: Their Treatments and Prevention",
    title_hi: "ध्यान देने योग्य लक्षण",
  img: "/education/symptoms-local.png",
    steps_en: [
      "Start ORS for dehydration; give small frequent sips",
      "See a doctor; take antibiotics only if prescribed",
      "Severe dehydration: go to clinic/hospital for IV fluids",
      "Give zinc to children with diarrhea for 10–14 days",
      "Drink only boiled/chlorinated/filtered water",
      "Wash hands with soap before eating and after toilet",
      "Keep food covered; cook thoroughly; avoid stale street food",
      "Keep water containers covered; use a clean ladle",
      "Get vaccines where available (typhoid, hepatitis A)",
    ],
    steps_hi: [
      "डिहाइड्रेशन के लिए ओआरएस दें; थोड़ी‑थोड़ी मात्रा बार‑बार",
      "डॉक्टर से मिलें; एंटीबायोटिक केवल सलाह पर लें",
      "गंभीर डिहाइड्रेशन में क्लिनिक/अस्पताल जाएँ (IV फ़्लूइड)",
      "दस्त वाले बच्चों को 10–14 दिन जिंक दें",
      "सिर्फ उबला/क्लोरीनयुक्त/फ़िल्टर किया पानी पिएँ",
      "खाने से पहले और शौच के बाद साबुन से हाथ धोएँ",
      "खाना ढककर रखें; अच्छी तरह पकाएँ; बासी स्ट्रीट फूड से बचें",
      "पानी के बर्तनों को ढककर रखें; साफ कलछी से निकालें",
      "जहाँ उपलब्ध हो, टाइफाइड/हेपेटाइटिस A का टीका लगवाएँ",
    ],
  },
]

export default function EducationPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Educational Resources</h1>
            <p className="text-muted-foreground">Infographics, videos, and guides to prevent water-borne diseases.</p>
          </div>

          <Tabs defaultValue="en" className="w-full">
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">हिन्दी</TabsTrigger>
            </TabsList>

            {/* English Content */}
            <TabsContent value="en" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Guides</CardTitle>
                  <CardDescription>Simple, practical steps for households</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {guides.map((g) => (
                      <div key={g.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-1">{g.title_en}</h3>
                        <p className="text-sm text-muted-foreground">{g.content_en}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5" /> Videos</CardTitle>
                  <CardDescription>Short explainers you can share</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {videos.map((v) => (
                      <div key={v.id}>
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {v.embed ? (
                            <iframe
                              src={v.embed}
                              title={v.title_en}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full rounded-md"
                            />
                          ) : (
                            <a href={v.watch} aria-label={`Watch ${v.title_en} on YouTube`} className="relative block w-full h-full group">
                              <img src={v.thumb} alt={v.title_en} className="w-full h-full object-cover rounded-md" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="inline-flex items-center gap-2 rounded-full bg-black/60 text-white px-4 py-2 text-sm opacity-90 group-hover:opacity-100 transition">
                                  <PlayCircle className="h-5 w-5" />
                                  Play
                                </span>
                              </div>
                            </a>
                          )}
                        </AspectRatio>
                        <p className="mt-2 text-sm font-medium">{v.title_en}</p>
                        <a
                          href={v.watch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Infographics</CardTitle>
                  <CardDescription>Visual references for awareness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {infographics.map((i) => (
                      <Dialog key={i.id}>
                        <DialogTrigger asChild>
                          <button className="p-3 border rounded-lg text-left hover:bg-muted/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <img src={i.img} alt={i.title_en} className="w-full h-40 object-contain rounded bg-muted p-1" />
                            <p className="mt-2 text-sm font-medium">{i.title_en}</p>
                            <p className="text-xs text-muted-foreground">Click to view steps</p>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{i.title_en}</DialogTitle>
                            <DialogDescription>Step-by-step guide</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img src={i.img} alt={i.title_en} className="w-full h-48 object-contain rounded bg-muted p-1" />
                            {/* Visual reference icons */}
                            {i.id === 1 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Visual reference</p>
                                <div className="grid grid-cols-5 gap-3 text-center">
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                      <Droplet className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Collect</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <Flame className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Boil</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Cover</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                      <Filter className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Filter</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                      <Package className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Store</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {i.id === 2 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Visual reference</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                      <Droplet className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Cholera</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Typhoid Fever</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                      <Thermometer className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Diarrhea</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Giardia</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">Botulism</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <ol className="list-decimal pl-5 space-y-2">
                              {i.steps_en.map((s: string, idx: number) => (
                                <li key={idx} className="text-sm leading-relaxed">{s}</li>
                              ))}
                            </ol>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hindi Content */}
            <TabsContent value="hi" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> गाइड्स</CardTitle>
                  <CardDescription>घरों के लिए सरल और व्यावहारिक उपाय</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {guides.map((g) => (
                      <div key={g.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-1">{g.title_hi}</h3>
                        <p className="text-sm text-muted-foreground">{g.content_hi}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5" /> वीडियो</CardTitle>
                  <CardDescription>संक्षिप्त समझाने वाले वीडियो जिन्हें आप शेयर कर सकते हैं</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {videos.map((v) => (
                      <div key={v.id}>
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {v.embed ? (
                            <iframe
                              src={v.embed}
                              title={v.title_hi}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full rounded-md"
                            />
                          ) : (
                            <a href={v.watch} aria-label={`YouTube पर देखें: ${v.title_hi}`} className="relative block w-full h-full group">
                              <img src={v.thumb} alt={v.title_hi} className="w-full h-full object-cover rounded-md" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="inline-flex items-center gap-2 rounded-full bg-black/60 text-white px-4 py-2 text-sm opacity-90 group-hover:opacity-100 transition">
                                  <PlayCircle className="h-5 w-5" />
                                  प्ले
                                </span>
                              </div>
                            </a>
                          )}
                        </AspectRatio>
                        <p className="mt-2 text-sm font-medium">{v.title_hi}</p>
                        <a
                          href={v.watch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          YouTube पर देखें
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> इन्फोग्राफिक्स</CardTitle>
                  <CardDescription>जागरूकता के लिए दृश्य संदर्भ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {infographics.map((i) => (
                      <Dialog key={i.id}>
                        <DialogTrigger asChild>
                          <button className="p-3 border rounded-lg text-left hover:bg-muted/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <img src={i.img} alt={i.title_hi} className="w-full h-40 object-contain rounded bg-muted p-1" />
                            <p className="mt-2 text-sm font-medium">{i.title_hi}</p>
                            <p className="text-xs text-muted-foreground">स्टेप्स देखने के लिए क्लिक करें</p>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{i.title_hi}</DialogTitle>
                            <DialogDescription>कदम-दर-कदम मार्गदर्शिका</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img src={i.img} alt={i.title_hi} className="w-full h-48 object-contain rounded bg-muted p-1" />
                            {/* Visual reference icons */}
                            {i.id === 1 && (
                              <div>
                                <p className="text-sm font-medium mb-2">दृश्य संदर्भ</p>
                                <div className="grid grid-cols-5 gap-3 text-center">
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                      <Droplet className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">संग्रह</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <Flame className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">उबालें</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">ढकें</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                      <Filter className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">फ़िल्टर</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                      <Package className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">भंडारण</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {i.id === 2 && (
                              <div>
                                <p className="text-sm font-medium mb-2">दृश्य संदर्भ</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                      <Droplet className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">हैजा</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">टाइफाइड बुखार</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                                      <Thermometer className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">दस्त</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 itemscenter justify-center rounded-full bg-blue-100 text-blue-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">जिआर्डिया</p>
                                  </div>
                                  <div className="rounded-xl border bg-muted/50 p-3">
                                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                      <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs">बोटुलिज़्म</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <ol className="list-decimal pl-5 space-y-2">
                              {i.steps_hi.map((s: string, idx: number) => (
                                <li key={idx} className="text-sm leading-relaxed">{s}</li>
                              ))}
                            </ol>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
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
