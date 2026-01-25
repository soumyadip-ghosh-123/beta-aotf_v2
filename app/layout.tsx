import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { navConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import FloatingButton from "@/components/FloatingButton";
import ClickSpark from "@/components/reactbits/ui/ClickSpark";

export const metadata: Metadata = {
  title: {
    default: navConfig.name,
    template: `%s - ${navConfig.name}`,
  },
  description: navConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ClickSpark
          sparkSize={9}
          sparkRadius={25}
          duration={500}
          extraScale={0.9}
        >
          <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <div className="relative flex flex-col">
              <FloatingButton />
              <Navbar />
              <main className="container mx-auto grow px-2">{children}</main>
            </div>
          </Providers>
        </ClickSpark>
      </body>
    </html>
  );
}
