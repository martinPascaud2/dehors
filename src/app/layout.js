import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  manifest: "/manifest.json",
  title: "Dehors",
  description: "Jeux sociaux extérieurs",
};

export const viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <meta name="mobile-web-app-capable" content="yes"></meta>
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      ></meta>
      <meta name="theme-color" content="#000000"></meta>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen`}
      >
        {children}
      </body>
    </html>
  );
}
