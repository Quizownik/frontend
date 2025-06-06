import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from "@/app/[locale]/lib/session";
import { API_BASE_URL } from "@/app/[locale]/lib/utils";
import { z } from 'zod';

// Schema for password validation
const passwordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character',
    })
    .trim();

// Schema for password change request
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: passwordSchema,
    confirmationPassword: z.string()
}).refine((data) => data.newPassword === data.confirmationPassword, {
    message: 'New password and confirmation password do not match',
    path: ['confirmationPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password cannot be the same as the current password',
    path: ['newPassword'],
});

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requestBody = await request.json();

        // Validate with Zod schema
        try {
            changePasswordSchema.parse(requestBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                return NextResponse.json(
                    { message: errorMessage },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { message: 'Invalid password data' },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword, confirmationPassword } = requestBody;

        // Make request to change password
        const response = await fetch(`${API_BASE_URL}/user/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.userToken}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmationPassword
            })
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Error changing password: ' + response.statusText },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { message: 'An error occurred while changing the password' },
            { status: 500 }
        );
    }
}
