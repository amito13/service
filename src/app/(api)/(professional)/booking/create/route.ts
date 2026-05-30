import { NextResponse } from "next/server";

import { db } from "@/index";

import {
  bookings,
  professionals,
  users,
  categories,
} from "@/db/schema";

import { eq, and } from "drizzle-orm";

import { getAuthUser } from "@/middleware/getAuthUser";

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
    // BODY
    // =========================

    const {
      professionalId,
      categoryId,
      description,
    } = await request.json();

    // =========================
    // VALIDATION
    // =========================

    if (
      !professionalId ||
      !categoryId ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "professionalId, categoryId and description are required",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK USER EXISTS
    // =========================

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
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

    const professional = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId))
      .then((rows) => rows[0]);

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          message: "Professional not found",
        },
        { status: 404 }
      );
    }

    // =========================
    // CHECK CATEGORY EXISTS
    // =========================

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .then((rows) => rows[0]);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // =========================
    // CREATE BOOKING
    // =========================

    const booking = await db
      .insert(bookings)
      .values({
        userId: authUser.id,
        professionalId,
        categoryId,
        description,
        status: "PENDING",
      })
      .returning();

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        data: booking[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error: booking creation failed",
      },
      { status: 500 }
    );
  }
}