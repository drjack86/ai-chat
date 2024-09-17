import type { Metadata } from "next";
import "./globals.css";

import { Inter } from 'next/font/google'

export const metadata: Metadata = {
    title: `${process.env.NEXT_PUBLIC_TITLE_APP}`,
    description: `${process.env.NEXT_PUBLIC_TITLE_DESCRIPTION}`,
};

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="it">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
