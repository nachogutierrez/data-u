import type { Metadata } from "next";
import { Rubik } from "next/font/google";
// import Navbar from "./Navbar"; 

import "@/app/globals.css";
import { SessionProvider } from "next-auth/react";

const font = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeWatch",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} m-0 flex flex-wrap items-center justify-center`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
