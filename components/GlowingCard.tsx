"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    fromColor?: string;
    viaColor?: string;
    toColor?: string;
}

export default function GlowingCard({
    children,
    className,
    fromColor = "#4158D0",
    viaColor = "#C850C0",
    toColor = "#FFCC70",
    ...props
}: GlowCardProps) {
    return (
        <div
            className={cn(
                "rounded-3xl p-0.5 transition-all duration-500 hover:shadow-[0_0_80px_rgba(192,132,252,0.6)] hover:brightness-125 group relative",
                className
            )}
            style={{
                backgroundImage: `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`,
            }}
            {...props}
        >
            <div className="relative h-full w-full rounded-[22px] bg-background">
                {/* Inner blur layer - optional, usually for background glow effect but can interfere with text. 
             The user's snippet had it covering content. I'll put it behind content. */}
                <div
                    className="absolute inset-0 rounded-[22px] opacity-40 blur-xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{
                        background: `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`,
                        zIndex: 0
                    }}
                />

                <div className="relative z-10 h-full w-full rounded-[22px] p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
