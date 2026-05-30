import {NextResponse} from 'next/server';
import {db} from '@/index';
import {users} from '@/db/schema';
import {signJwt} from '@/utils/jwt';
import {eq} from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try{
        const data = await request.json();
        const user = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
        if(user.length === 0){
            return NextResponse.json({message: "Invalid email or password"}, {status: 401});
        }
        const isPasswordValid = await bcrypt.compare(data.password, user[0].password);
        if(!isPasswordValid){
            return NextResponse.json({message: "Invalid email or password"}, {status: 401});
        }
        const token = signJwt(
                {
                    id: user[0].id,
                    account_type: user[0].accountType,
                },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
        );
        return NextResponse.json({token});
        }catch(error){
        console.error('Error logging in user:', error);
        return NextResponse.json({message: 'Internal Server Error: Error logging in user'}, {status: 500});
    }
}

