"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
    const rows = new Array(100).fill(1);
    const cols = new Array(200).fill(1);
    let colors = [
        "#7dd3fc", // sky-300
        "#f472b6", // pink-400
        "#4ade80", // green-400
        "#facc15", // yellow-400
        "#f87171", // red-400
        "#c084fc", // purple-400
        "#818cf8", // indigo-400
        "#a78bfa", // violet-400
        "#2dd4bf", // teal-400
    ];
    const getRandomColor = () => {
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div
            style={{
                transform: `translate(-50%,-50%) skewX(-48deg) skewY(14deg) scale(1.5) rotate(0deg) translateZ(0)`,
            }}
            className={cn(
                "absolute top-1/2 left-1/2 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
                className,
            )}
            {...rest}
        >
            {rows.map((_, i) => (
                <motion.div
                    key={`row` + i}
                    className="relative h-8 w-16 border-l border-slate-200 dark:border-slate-800"
                >
                    {cols.map((_, j) => (
                        <motion.div
                            whileHover={{
                                backgroundColor: `${getRandomColor()}`,
                                transition: { duration: 0 },
                            }}
                            animate={{
                                transition: { duration: 2 },
                            }}
                            key={`col` + j}
                            className="relative h-8 w-16 border-t border-r border-slate-200 dark:border-slate-800"
                        >
                            {j % 2 === 0 && i % 2 === 0 ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-slate-200 dark:text-slate-800"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v12m6-6H6"
                                    />
                                </svg>
                            ) : null}
                        </motion.div>
                    ))}
                </motion.div>
            ))}
        </div>
    );
};

export const Boxes = React.memo(BoxesCore);
