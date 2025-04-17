import type { Metadata } from "next";
import "./globals.css";

import { Fredoka } from 'next/font/google';

import React from "react";

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
    title: 'Quizownik',
    description: 'Zabawa z quizami!',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${fredoka.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
