import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  manifest: "/manifest.json",
  title: "Social Games",
  description: "Application de jeux sociaux",
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

      <body className={`${inter.className}`}>
        <div className="h-screen">{children}</div>
      </body>
    </html>
  );
}
