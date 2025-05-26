import { SignupFormSchema} from '@/app/[locale]/lib/definitions'

export async function signup(formData: FormData) {
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // fetch API endpoint
    const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: validatedFields.data.name,
            email: validatedFields.data.email,
            password: validatedFields.data.password,
        }),
    })

    if (!response.ok) {
        let errorData = { message: 'An error occurred' };
        try {
            // Sprawdź, czy odpowiedź ma body
            const text = await response.text();
            if (text) {
                errorData = JSON.parse(text);
            }
        } catch (e) {
            console.error(e);
        }
        return {
            errors: {
                email: [errorData.message || 'An error occurred'],
            },
        }
    }

    return {
        message: 'Registration successful! Please check your email to verify your account.',
        success: true,
    }
}

