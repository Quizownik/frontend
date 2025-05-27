import type {Metadata} from "next";
import "./globals.css";

import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';


import {Fredoka} from 'next/font/google';

import React, {ReactNode} from "react";
import Header from "@/app/[locale]/components/Header";
import Footer from "@/app/[locale]/components/Footer";

const fredoka = Fredoka({subsets: ['latin'], weight: ['400', '700']});

export const metadata: Metadata = {
    title: 'Quizownik',
    description: 'Zabawa z quizami!',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
    },
};

export default async function RootLayout({children, params}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
        <body
            className={`${fredoka.className} antialiased`}
        >
        <NextIntlClientProvider>
            <Header/>
            {children}
            <Footer/>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
