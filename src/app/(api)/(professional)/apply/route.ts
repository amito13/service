// import {db} from '@/index';
// import { getAuthUser } from '@/middleware/getAuthUser';
// import { NextResponse } from 'next/server';
// import {professionals, users} from '@/db/schema';
// import { eq } from 'drizzle-orm';


// export async function POST(request: Request) {
//     try {

//       const authUser = await getAuthUser();
//       if (!authUser) {
//             return NextResponse.json(
//                 {
//                 success: false,
//                 message: "Unauthorized",
//                 },
//                 { status: 401 }
//             );
//             }

//     const {description } = await request.json();
//     const loggedInUserId = authUser.id;

//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, loggedInUserId))
//       .then((rows) => rows[0]);

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }


  

//     const existingProfessional = await db
//       .select()
//       .from(professionals)
//       .where(
//         eq(
//           professionals.userId,
//           loggedInUserId
//         )
//       )
//       .then((rows) => rows[0]);

//     if (existingProfessional) {

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Professional profile already exists",
//         },
//         { status: 400 }
//       );
//     }




//    await db.transaction(async (tx) => {

//     await tx.insert(professionals).values({
//       userId: authUser.id,
//         description: description,
//     });

//     await tx
//         .update(users)
//         .set({
//         accountType: "PROFESSIONAL",
//         })
//         .where(
//         eq(users.id, authUser.id)
//         );
// });


    

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           "Professional account created successfully",
//       },
//       { status: 201 }
//     );

//   } catch (error) {

//     console.log(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Internal server error: professional application failed " + error,
//       },
//       { status: 500 }
//     );
//     }
// }
import { db } from "@/index";
import { getAuthUser } from "@/middleware/getAuthUser";
import { NextResponse } from "next/server";

import {
  professionals,
  professionalCategories,
  categories,
  users,
} from "@/db/schema";

import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // =========================
    // AUTH USER
    // =========================

    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // =========================
    // REQUEST BODY
    // =========================

    const { description, categoryIds } = await request.json();

    // =========================
    // VALIDATION
    // =========================

    if (!description || !categoryIds) {
      return NextResponse.json(
        {
          success: false,
          message: "Description and categoryIds are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        {
          success: false,
          message: "categoryIds must be an array",
        },
        { status: 400 }
      );
    }

    const loggedInUserId = authUser.id;

    // =========================
    // CHECK USER EXISTS
    // =========================

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, loggedInUserId))
      .then((rows) => rows[0]);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // =========================
    // CHECK PROFESSIONAL EXISTS
    // =========================

    const existingProfessional = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, loggedInUserId))
      .then((rows) => rows[0]);

    if (existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          message: "Professional profile already exists",
        },
        { status: 400 }
      );
    }

    // =========================
    // VALIDATE CATEGORY IDS
    // =========================

    const validCategories = await db
      .select()
      .from(categories)
      .where(inArray(categories.id, categoryIds));

    if (validCategories.length !== categoryIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more category IDs are invalid",
        },
        { status: 400 }
      );
    }

    // =========================
    // TRANSACTION
    // =========================

    await db.transaction(async (tx) => {
      // CREATE PROFESSIONAL

      const newProfessional = await tx
        .insert(professionals)
        .values({
          userId: loggedInUserId,
          description,
        })
        .returning();

      const professionalId = newProfessional[0].id;

      // INSERT PROFESSIONAL CATEGORIES

      await tx.insert(professionalCategories).values(
        categoryIds.map((categoryId: number) => ({
          professionalId,
          categoryId,
        }))
      );

      // UPDATE USER ACCOUNT TYPE

      await tx
        .update(users)
        .set({
          accountType: "PROFESSIONAL",
        })
        .where(eq(users.id, loggedInUserId));
    });

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Professional account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error: professional application failed",
      },
      { status: 500 }
    );
  }
}