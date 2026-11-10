import type { Metadata, Viewport } from "next";
import { Geist_Mono, Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppUpdates } from "@/components/pwa/app-updates";
import { Toaster } from "@/components/ui/toast";
import { appVersion } from "@/lib/app-version";
import { siteConfig } from "@/lib/site";
import { systemBarColor } from "@/lib/theme-colors";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: systemBarColor,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster>
            {children}
            <AppUpdates version={appVersion} />
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
