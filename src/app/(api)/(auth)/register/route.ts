import {NextResponse} from 'next/server';
import {db} from '@/index';
import {users} from '@/db/schema';
import bcrypt from 'bcrypt';
import {eq} from 'drizzle-orm';


export async function POST(request: Request) {
    try{
        const {name, email, contact, password, city, state, pincode} = await request.json();

        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if(existingUser.length > 0){
            return NextResponse.json({message: 'User already exists'}, {status: 400});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(users).values({
            name,
            email,
            contact,
            password: hashedPassword,
            city,
            state,
            pincode
        });
        return NextResponse.json({message: 'User registered successfully'}, {status: 201});
    }catch(error){
        console.error('Error registering user:', error);
        return NextResponse.json({message: 'Internal Server Error: Error registering user'}, {status: 500});
    }
}