import {NextRequest, NextResponse} from 'next/server';
import {getCurrentUser} from "@/app/[locale]/lib/session";
import {API_BASE_URL} from "@/app/[locale]/lib/utils";
import {z} from 'zod';
import {getTranslations} from 'next-intl/server';

// Schema for password validation
const createPasswordSchema = (t: any) => z
    .string()
    .min(8, {message: t('API.errors.passwordMinLength')})
    .regex(/[a-zA-Z]/, {message: t('API.errors.passwordLetterRequired')})
    .regex(/[0-9]/, {message: t('API.errors.passwordNumberRequired')})
    .regex(/[^a-zA-Z0-9]/, {
        message: t('API.errors.passwordSpecialCharRequired'),
    })
    .trim();

// Schema for password change request
const createChangePasswordSchema = (t: any) => z.object({
    currentPassword: z.string().min(1, {message: t('API.errors.currentPasswordRequired')}),
    newPassword: createPasswordSchema(t),
    confirmationPassword: z.string()
}).refine((data) => data.newPassword === data.confirmationPassword, {
    message: t('API.errors.passwordMismatch'),
    path: ['confirmationPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: t('API.errors.passwordSameAsCurrent'),
    path: ['newPassword'],
});

export async function PATCH(request: NextRequest) {
    try {
        // Get translations based on the request locale
        const {pathname} = new URL(request.url);
        const locale = pathname.split('/')[1];
        const t = await getTranslations({locale, namespace: ''});

        const user = await getCurrentUser();

        if (!user || !user.userToken) {
            return NextResponse.json({error: t('API.errors.unauthorized')}, {status: 401});
        }

        const requestBody = await request.json();

        // Create schema with translations
        const changePasswordSchema = createChangePasswordSchema(t);

        // Validate with Zod schema
        try {
            changePasswordSchema.parse(requestBody);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                return NextResponse.json(
                    {message: errorMessage},
                    {status: 400}
                );
            }

            return NextResponse.json(
                {message: t('API.errors.invalidPasswordData')},
                {status: 400}
            );
        }

        const {currentPassword, newPassword, confirmationPassword} = requestBody;

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
        console.log(response);
        if (response.status === 401) {
            return NextResponse.json(
                {message: t('API.errors.usernameOrPasswordIsIncorrect')},
                {status: response.status}
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                {message: t('API.errors.passwordChangeError'), status: response.status},
                {status: response.status}
            );
        }

        return NextResponse.json({message: t('API.errors.passwordChangeSuccess')});
    } catch (error) {
        console.error('Error changing password:', error);
        // Get translations for the fallback error message
        const defaultLocale = 'pl'; // Default locale as fallback
        const t = await getTranslations({locale: defaultLocale, namespace: ''});

        return NextResponse.json(
            {message: t('API.errors.internalServerError')},
            {status: 500}
        );
    }
}
