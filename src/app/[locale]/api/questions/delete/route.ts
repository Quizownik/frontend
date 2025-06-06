import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from "@/app/[locale]/lib/session";
import { API_BASE_URL } from "@/app/[locale]/lib/utils";
import { getTranslations } from 'next-intl/server';

export async function DELETE(request: NextRequest) {
    try {
        // Get translations based on the request locale
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: 'AdminPage' });
        const apiT = await getTranslations({ locale, namespace: 'API.errors' });

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ message: apiT('unauthorized') }, { status: 401 });
        }

        const requestBody = await request.json();
        const { id } = requestBody;

        if (!id) {
            return NextResponse.json({ message: apiT('invalidData') }, { status: 400 });
        }

        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.userToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({
                message: t('deleteError'),
                details: errorText
            }, { status: response.status });
        }

        return NextResponse.json({ message: t('questionDeleted') });
    } catch (error) {
        console.error('Error in questions/delete API:', error);
        // Fallback do domyślnego języka w przypadku błędu
        const defaultLocale = 'pl';
        const t = await getTranslations({ locale: defaultLocale, namespace: 'AdminPage' });

        return NextResponse.json(
            { message: t('deleteError') },
            { status: 500 }
        );
    }
}
