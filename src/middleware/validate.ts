import {z} from 'zod';
import {NextResponse} from 'next/server';

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    contact: z.string().min(10, 'Contact number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(5, 'Pincode must be at least 5 digits')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});
export  const validateData =async  (request: Request) => {
    try {
         const data = await request.json();
         const validatedData =  registerSchema.safeParse(data);
         if (!validatedData.success) {
             return {
            success: false,
            errors: validatedData.error.flatten(),
        };
         }
         return{
                success: true,
                data: validatedData.data

         }
    } catch (error) {
       return {
            success: false,
            errors: "Invalid request body",
        };
    }
};
export const validateLoginData = async (request: Request) => {
    try {
            const data = await request.json();
            const validatedData = loginSchema.safeParse(data);
            if (!validatedData.success) {
                return {
                    success: false,
                    errors: validatedData.error.flatten(),
                };
            }
            return {
                success: true,
                data: validatedData.data
            }
    } catch (error) {
        return {
            success: false,
            errors: "Invalid request body",
        };
    }
};

