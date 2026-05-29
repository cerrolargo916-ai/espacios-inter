import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Espacios Inter - Espacio para tu bienestar",
  description: "Consultorio de psicología dirigido por Lic. Silvia Hara. Terapia individual, de pareja y familiar. Sesiones presenciales y online.",
  keywords: ["psicología", "terapia", "bienestar", "salud mental", "consultorio", "Lic. Silvia Hara", "Espacios Inter"],
  authors: [{ name: "Lic. Silvia Hara" }],
  icons: {
    icon: "/logo-espacios-inter.png",
  },
  openGraph: {
    title: "Espacios Inter - Espacio para tu bienestar",
    description: "Consultorio de psicología. Terapia individual, de pareja y familiar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
