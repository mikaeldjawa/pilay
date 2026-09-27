import { Providers } from "@/components/layout/providers";
import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pilay",
  description: "Counselor Management & Student Support Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang='en'
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <Script
          src='https://dbe-ticketing-dev.w1npay.com//widget.js'
          data-widget-key='wgt_50e47ccb2c84099d897059955062be0d'
          data-accent-color='#3344C9'
          data-launcher-position='bottom-right'
          strategy='lazyOnload'
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
