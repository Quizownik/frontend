import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/app/[locale]/lib/session';
import {API_BASE_URL} from "@/app/[locale]/lib/utils";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            headers: {
                'Authorization': `Bearer ${user.userToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }


        return NextResponse.json({user});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
        return NextResponse.json({error: 'Backend unavailable'}, {status: 503});
    }
}


