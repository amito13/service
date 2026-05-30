import {NextResponse} from 'next/server';
import {db} from '@/index';
import {users} from '@/db/schema';
// Suppress missing type declarations for bcrypt
// @ts-ignore
import bcrypt from 'bcrypt';
import {eq} from 'drizzle-orm';
import {validateData} from '@/middleware/validate';

export async function POST(request: Request) {
    try{
        
        const validationResult = await validateData(request);

        if (!validationResult.success) {
            return NextResponse.json({ errors: validationResult.errors }, { status: 400 });
        }

      

        const existingUser = await db.select().from(users).where(eq(users.email, validationResult.data!.email));

        if(existingUser.length > 0){
            return NextResponse.json({message: 'User already exists'}, {status: 400});
        }
        
        const hashedPassword = await bcrypt.hash(validationResult.data!.password, 10);
        await db.insert(users).values({
            name: validationResult.data!.name,
            email: validationResult.data!.email,
            contact: validationResult.data!.contact,
            password: hashedPassword,
            city: validationResult.data!.city,
            state: validationResult.data!.state,
            pincode: validationResult.data!.pincode
        });
        return NextResponse.json({message: 'User registered successfully'}, {status: 201});
    }catch(error){
        console.error('Error registering user:', error);
        return NextResponse.json({message: 'Internal Server Error: Error registering user'}, {status: 500});
    }
}