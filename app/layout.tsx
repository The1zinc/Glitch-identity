import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css';

export const metadata: Metadata = {
    title: 'Glitch Identity',
    description: 'Cyberpunk Identity Generator',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-black text-terminal antialiased min-h-screen flex flex-col items-center justify-center p-4 selection:bg-terminal selection:text-black">
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
