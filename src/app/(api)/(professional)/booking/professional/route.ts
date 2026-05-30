import { NextResponse } from "next/server";

import { db } from "@/index";

import {
  bookings,
  professionals,
  users,
  categories,
} from "@/db/schema";

import { eq } from "drizzle-orm";

import { getAuthUser } from "@/middleware/getAuthUser";

export async function GET() {
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
    // FIND PROFESSIONAL
    // =========================

    const professional = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, authUser.id))
      .then((rows) => rows[0]);

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          message: "Professional profile not found",
        },
        { status: 404 }
      );
    }

    // =========================
    // GET BOOKINGS
    // =========================

    const professionalBookings = await db
      .select({
        bookingId: bookings.id,

        status: bookings.status,

        description: bookings.description,

        createdAt: bookings.createdAt,

        customerName: users.name,

        customerEmail: users.email,

        customerContact: users.contact,

        customerCity: users.city,

        customerState: users.state,

        categoryName: categories.name,
      })

      .from(bookings)

      .innerJoin(
        users,
        eq(bookings.userId, users.id)
      )

      .innerJoin(
        categories,
        eq(bookings.categoryId, categories.id)
      )

      .where(
        eq(
          bookings.professionalId,
          professional.id
        )
      );

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        data: professionalBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error: failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}