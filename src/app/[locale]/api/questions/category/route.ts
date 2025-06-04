import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/app/[locale]/lib/session";
import {API_BASE_URL} from "@/app/[locale]/lib/utils";

export async function GET(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user || !user.userToken) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    const sort = "";

    if (!category) {
        return NextResponse.json(
            {message: 'Category is required'},
            {status: 400}
        );
    }

    try {
        console.log(`${API_BASE_URL}/questions/category/${encodeURIComponent(category)}?page=${page}&size=${size}&sort=${sort}`)
        const response = await fetch(`${API_BASE_URL}/questions/category/${encodeURIComponent(category)}?page=${page}&size=${size}&sort=${sort}`, {
            headers: {
                'Authorization': `Bearer ${user.userToken}`,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            return NextResponse.json(
                {message: 'Failed to fetch questions'},
                {status: response.status}
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching questions by category:', error);
        return NextResponse.json(
            {message: 'Internal server error'},
            {status: 500}
        );
    }
}
