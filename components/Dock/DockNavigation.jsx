"use client";

import { useRouter } from "next/navigation";

import {
    Activity,
    BookOpen,
    Mail,
    Rocket,
    Info
} from "lucide-react";
import Dock from "./Dock";

export default function DockNavigation() {
    const router = useRouter();


    // Handlers for navigation
    const handleNav = (path) => {
        router.push(path);
    };



    const items = [
        {
            icon: <Activity size={20} className="text-primary" />,
            label: "Features",
            onClick: () => handleNav("#features"),
        },
        {
            icon: <Info size={20} className="text-primary" />,
            label: "About",
            onClick: () => handleNav("#about"), // Assuming #about exists or mapping appropriately
        },
        {
            icon: <Mail size={20} className="text-primary" />,
            label: "Contact",
            onClick: () => handleNav("#contact"),
        },
        {
            icon: <Rocket size={20} className="text-primary" />,
            label: "Get Started",
            onClick: () => handleNav("/login"),
        },

    ];

    return (
        <div className="relative h-[80px] w-full flex items-center justify-center">
            <Dock
                items={items}
                panelHeight={60}
                baseItemSize={45}
                magnification={65}
                distance={100}
            />
        </div>
    );
}
