import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css';

export const metadata: Metadata = {
    title: 'Glitch Identity',
    description: 'Cyberpunk Identity Generator',
    openGraph: {
        title: 'Glitch Identity',
        description: 'Generate your cyberpunk identity.',
        images: ['/icon.png'],
    },
    other: {
        'base:app_id': '6980cfa82aafa0bc9ad8a5cf',
        'fc:frame': 'vNext',
        'fc:frame:image': 'https://glitch-identity.vercel.app/icon.png', // Fallback, should be dynamic in real app
        'fc:frame:button:1': 'Launch App',
        'fc:frame:button:1:action': 'link',
        'fc:frame:button:1:target': 'https://glitch-identity.vercel.app',
    },
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
