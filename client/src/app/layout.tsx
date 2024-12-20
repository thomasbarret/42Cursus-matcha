import type { Metadata } from "next";
import localFont from "next/font/local";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import RouterTransition from "@/components/layout/navigation-progress";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "matcha",
    description: "Find your perfect match",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <MantineProvider>
                    <RouterTransition />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
