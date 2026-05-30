import {NextResponse} from "next/server";
import {db} from "@/index";
import {professionals, users, professionalCategories} from "@/db/schema";
import { eq } from "drizzle-orm";


//thing is that we need to get the proffessional detail by their category id ,  return all the detailes name age city state contact and description of the proffessional and also return the category name in which they are working
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        if (!categoryId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category ID is required",
                },
                { status: 400 }
            );
        }
        const pros = await db
            .select({
                id: professionals.id,
                name: users.name,
                email: users.email,
                contact: users.contact,
                city: users.city,
                state: users.state,
                description: professionals.description,
            })
            .from(professionals)
            .innerJoin(users, eq(professionals.userId, users.id))
            .innerJoin(professionalCategories, eq(professionals.id, professionalCategories.professionalId))
            .where(eq(professionalCategories.categoryId, Number(categoryId)));
        return NextResponse.json({ professionals: pros }, { status: 200 });
    } catch (error) {
        console.error("Error fetching professionals:", error);
        return NextResponse.json({ message: "Internal Server Error: Error fetching professionals" }, { status: 500 });
    }
}
