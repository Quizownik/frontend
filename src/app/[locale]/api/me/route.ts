import { NextResponse } from 'next/server';
import {deleteSession, getCurrentUser} from '@/app/[locale]/lib/session';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        await deleteSession();
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user });
}

