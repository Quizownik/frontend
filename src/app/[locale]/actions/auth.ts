import {LoginFormSchema, SignupFormSchema} from '@/app/[locale]/lib/definitions'
import {redirect} from "next/navigation";
import {createSession, deleteSession} from "@/app/[locale]/lib/session";
import {API_BASE_URL} from "@/app/[locale]/lib/utils";

export async function signup(formData: FormData) {
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        username: formData.get('username'),
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
    const response = await fetch(API_BASE_URL + '/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstname: validatedFields.data.firstname,
            lastname: validatedFields.data.lastname,
            username: validatedFields.data.username,
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            role: 'USER',
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

    const data = await response.json()
    if (!data.access_token) {
        return {
            errors: {
                email: ['Unexpected response from server'],
            },
        }
    }

    await createSession(data.access_token)

    redirect('/profile')
}

export async function login(formData: FormData) {
    // Validate form fields
    const validatedFields = LoginFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // fetch API endpoint
    const response = await fetch(API_BASE_URL+'/auth/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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

    const data = await response.json()
    if (!data.access_token) {
        return {
            errors: {
                email: ['Unexpected response from server'],
            },
        }
    }

    console.log(data)

    await createSession(data.access_token)

    redirect('/profile')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
