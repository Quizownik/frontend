import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/[locale]/lib/session';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user });
}

