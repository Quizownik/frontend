import {z} from 'zod'
import {JWTPayload} from 'jose'

export const SignupFormSchema = z.object({
    firstname: z
        .string()
        .min(2, {message: 'Name must be at least 2 characters long.'})
        .trim(),
    lastname: z
        .string()
        .min(2, {message: 'Lastname must be at least 2 characters long.'})
        .trim(),
    username: z
        .string()
        .min(2, {message: 'Username must be at least 2 characters long.'})
        .trim(),
    email: z.string().email({message: 'Please enter a valid email.'}).trim(),
    password: z
        .string()
        .min(8, {message: 'Be at least 8 characters long'})
        .regex(/[a-zA-Z]/, {message: 'Contain at least one letter.'})
        .regex(/[0-9]/, {message: 'Contain at least one number.'})
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
    confirmPassword: z
        .string()
        .min(8, {message: 'Be at least 8 characters long'})
        .regex(/[a-zA-Z]/, {message: 'Contain at least one letter.'})
        .regex(/[0-9]/, {message: 'Contain at least one number.'})
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export const LoginFormSchema = z.object({
    email: z.string().email({message: 'Please enter a valid email.'}).trim(),
    password: z
        .string()
        .min(8, {message: 'Be at least 8 characters long'})
        .regex(/[a-zA-Z]/, {message: 'Contain at least one letter.'})
        .regex(/[0-9]/, {message: 'Contain at least one number.'})
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
})


export interface SessionPayload extends JWTPayload {
    userToken: string;
    expiresAt: string;
}
