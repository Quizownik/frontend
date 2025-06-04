import {NextRequest, NextResponse} from "next/server";
import {getTranslations} from "next-intl/server";
import {API_BASE_URL} from "@/app/[locale]/lib/utils";
import {getCurrentUser} from "@/app/[locale]/lib/session";

const NO_CONTENT_STATUS = 204;

export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            const t = await getTranslations('API');
            return NextResponse.json(
                { message: t('quizIdRequired') },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.userToken}`,
                'Content-Type': 'application/json',
            },
        });
        //zrobić na nno content
        if (response.status !== NO_CONTENT_STATUS) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || 'Failed to delete quiz' },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
