import {NextRequest, NextResponse} from 'next/server';
import {getCurrentUser} from "@/app/[locale]/lib/session";
import {API_BASE_URL} from "@/app/[locale]/lib/utils";

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const requestBody = await request.json();
        const {currentPassword, newPassword, confirmationPassword} = requestBody;

        // Validate request data
        if (!currentPassword || !newPassword || !confirmationPassword) {
            return NextResponse.json(
                {message: 'All fields are required'},
                {status: 400}
            );
        }

        if (newPassword !== confirmationPassword) {
            return NextResponse.json(
                {message: 'New password and confirmation password do not match'},
                {status: 400}
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                {message: 'Password must be at least 8 characters long'},
                {status: 400}
            );
        }

        // Make request to change password
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
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
            const errorData = await response.json();
            return NextResponse.json(
                {message: errorData.message || 'Error changing password'},
                {status: response.status}
            );
        }

        return NextResponse.json({message: 'Password changed successfully'});
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            {message: 'An error occurred while changing the password'},
            {status: 500}
        );
    }
}
