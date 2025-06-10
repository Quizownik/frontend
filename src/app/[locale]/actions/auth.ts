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
        // Zamień klucze błędów na klucze tłumaczeń z messages
        const fieldErrors = validatedFields.error.flatten().fieldErrors as Record<string, string[]>;
        const translatedErrors: Record<string, string[]> = {};
        for (const key in fieldErrors) {
            if (Object.prototype.hasOwnProperty.call(fieldErrors, key) && Array.isArray(fieldErrors[key])) {
                translatedErrors[key] = (fieldErrors[key] as string[]).map((err: string) => {
                    switch (key) {
                        case 'firstname':
                            return 'firstnameRequired';
                        case 'lastname':
                            return 'lastnameRequired';
                        case 'username':
                            return 'usernameRequired';
                        case 'email':
                            return 'emailInvalid';
                        case 'password':
                            if (err.includes('8')) return 'passwordMinLength';
                            if (err.toLowerCase().includes('letter')) return 'passwordLetterRequired';
                            if (err.toLowerCase().includes('number')) return 'passwordNumberRequired';
                            if (err.toLowerCase().includes('special')) return 'passwordSpecialCharRequired';
                            return 'passwordInvalid';
                        case 'confirmPassword':
                            return 'confirmPasswordRequired';
                        default:
                            return err;
                    }
                });
            }
        }
        return {
            errors: translatedErrors,
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
        try {
            const text = await response.text();
            if (text) {
                JSON.parse(text);
            }
            if (response.status === 409) {
                return {
                    errors: {
                        email: ['emailTaken']
                    },
                }
            }
        } catch (e) {
            console.error(e);
        }
        return {
            errors: {
                email: ['errorMessage']
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
    try {
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
        const response = await fetch(API_BASE_URL + '/auth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: validatedFields.data.email,
                password: validatedFields.data.password,
            }),
        })

        // Specjalna obsługa błędów na podstawie statusu odpowiedzi
        if (!response.ok) {
            let errorData = { message: 'Invalid username or password' };

            try {
                // Sprawdź, czy odpowiedź ma body
                const text = await response.text();
                if (text) {
                    errorData = JSON.parse(text);
                }
            } catch (e) {
                console.error('Error parsing response:', e);
            }

            // Obsłuż konkretne kody statusu
            if (response.status === 401) {
                // Nieprawidłowe dane logowania
                return {
                    status: 401,
                    errors: {
                        email: ['invalid_credentials'],
                    },
                };
            } else if (response.status === 403) {
                return {
                    status: 403,
                    errors: {
                        email: ['account_blocked'],
                    },
                };
            } else if (response.status === 429) {
                return {
                    status: 429,
                    errors: {
                        email: ['too_many_requests'],
                    },
                };
            }

            // Dla innych błędów użyj wiadomości z API lub domyślnej
            return {
                status: response.status,
                errors: {
                    email: [errorData.message || 'Error occurred during login'],
                },
            };
        }

        try {
            const data = await response.json();

            if (!data.access_token) {
                return {
                    errors: {
                        email: ['unexpected_response'],
                    },
                };
            }

            // Utworzenie sesji i przekierowanie
            await createSession(data.access_token);
            return { success: true }; // Zwracamy sukces zamiast bezpośredniego przekierowania
        } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            return {
                errors: {
                    email: ['invalid_response_format'],
                },
            };
        }
    } catch (error) {
        console.error('Login error:', error);

        return {
            errors: {
                email: ['server_error'],
            },
        };
    }
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
