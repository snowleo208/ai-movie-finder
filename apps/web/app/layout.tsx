import type { Metadata } from "next";
import { Box, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import './globals.css';

export const metadata: Metadata = {
  title: "What Should I Watch Tonight?",
  description: "Discover your next favorite film with our AI-powered movie selector. Find the perfect movie in seconds!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          <Theme
            accentColor="indigo"
            grayColor="mauve"
            radius="large"
            scaling="100%"
          >
            {children}
          </Theme>
        </main>
      </body>
    </html>
  );
}
