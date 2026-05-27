import type { Metadata, Viewport } from "next";
import { Tiro_Bangla, Inter } from "next/font/google";
import "./globals.css";

const tiroBangla = Tiro_Bangla({
  weight: ["400"],
  variable: "--font-tiro-bangla",
  subsets: ["bengali"],
  style: "normal",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "কোরবানির গোশত বিতরণ ট্র্যাকার | Qurbani Meat Distribution Tracker",
  description: "এলাকার পরিবার প্রধানদের মধ্যে কোরবানির গোশত বিতরণের আধুনিক, মোবাইল-ফার্স্ট ও ক্লিন ট্র্যাকিং সিস্টেম",
  keywords: ["Qurbani", "Meat Distribution", "eid-ul-adha", "কোরবানি", "গোশত বিতরণ"],
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${tiroBangla.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="h-full flex justify-center bg-slate-100/60 dark:bg-[#070a12] font-sans antialiased text-foreground overflow-hidden">
        {/* Smartphone-sized frame on desktop, full-screen native on mobile devices */}
        <div className="w-full max-w-md h-full bg-background border-x border-border/80 dark:border-border/10 shadow-2xl flex flex-col relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
