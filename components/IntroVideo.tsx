"use client";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface IntroVideoProps {
    onComplete: () => void;
}

const IntroVideo = ({ onComplete }: IntroVideoProps) => {
    useEffect(() => {
        // Fallback timer to ensure it closes even if video fails or is shorter
        // Set to 7.5s to give a bit of buffer if video is exactly 7s
        const timer = setTimeout(() => {
            onComplete();
        }, 7500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
            <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={onComplete}
            >
                {/* Replace with your actual video path */}
                <source src="/assets/Video_Generation_Complete.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Skip button for user convenience */}
            <div className="absolute bottom-8 right-8 z-50">
                <Button
                    variant="ghost"
                    onClick={onComplete}
                    className="text-white hover:bg-white/10 hover:text-white"
                >
                    Skip
                </Button>
            </div>

            {/* Placeholder content if no video is present */}
            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-white bg-zinc-950">
                <h1 className="text-4xl font-bold animate-pulse">VillageVitals</h1>
                <p className="text-muted-foreground mt-4">Loading Experience...</p>
            </div>
        </motion.div>
    );
};

export default IntroVideo;
