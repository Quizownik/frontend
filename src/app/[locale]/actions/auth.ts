import {LoginFormSchema, SignupFormSchema} from '@/app/[locale]/lib/definitions'
import {redirect} from "next/navigation";
import {createSession, deleteSession} from "@/app/[locale]/lib/session";

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

    console.log(data)


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
    const response = await fetch('http://localhost:8080/api/v1/auth/authenticate', {
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

