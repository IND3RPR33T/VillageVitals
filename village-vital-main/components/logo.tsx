"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
  href?: string
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
} as const

export function Logo({ size = "md", showText = true, className, href = "/" }: LogoProps) {
  const [src, setSrc] = useState<string>("/logo.jpg")
  const dimension = sizeMap[size]

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="rounded-lg overflow-hidden flex items-center justify-center bg-transparent" style={{ width: dimension, height: dimension }}>
        <Image
          src={src}
          alt="VillageVitals logo"
          width={dimension}
          height={dimension}
          className="object-cover"
          onError={() => setSrc("/placeholder-logo.png")}
          priority
        />
      </div>
      {showText && <span className="font-bold text-primary">VillageVitals</span>}
    </div>
  )

  if (!href) return content
  return <Link href={href}>{content}</Link>
}
