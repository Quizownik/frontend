import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from "@/app/[locale]/lib/session";
import { API_BASE_URL } from "@/app/[locale]/lib/utils";
import { getTranslations } from 'next-intl/server';

export async function DELETE(request: NextRequest) {
    try {
        // Get translations based on the request locale
        const { pathname } = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({ locale, namespace: 'API.errors' });

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ message: t('unauthorized') }, { status: 401 });
        }

        const requestBody = await request.json();
        const { id } = requestBody;

        if (!id) {
            return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
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
                message: `Error deleting question: ${response.status}`,
                details: errorText
            }, { status: response.status });
        }

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error in questions/delete API:', error);
        return NextResponse.json(
            { message: 'An error occurred while deleting the question' },
            { status: 500 }
        );
    }
}
