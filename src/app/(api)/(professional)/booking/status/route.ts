import { NextResponse } from "next/server";

import { db } from "@/index";

import {
  bookings,
  professionals,
} from "@/db/schema";

import { eq, and } from "drizzle-orm";

import { getAuthUser } from "@/middleware/getAuthUser";

const ALLOWED_STATUS = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
];

export async function PATCH(request: Request) {
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
      bookingId,
      status,
    } = await request.json();

    // =========================
    // VALIDATION
    // =========================

    if (!bookingId || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            "bookingId and status are required",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status",
        },
        { status: 400 }
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
          message: "Professional not found",
        },
        { status: 404 }
      );
    }

    // =========================
    // FIND BOOKING
    // =========================

    const booking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),

          eq(
            bookings.professionalId,
            professional.id
          )
        )
      )
      .then((rows) => rows[0]);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking not found or unauthorized",
        },
        { status: 404 }
      );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    const updatedBooking = await db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json(
      {
        success: true,
        message:
          "Booking status updated successfully",
        data: updatedBooking[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error: failed to update booking status",
      },
      { status: 500 }
    );
  }
}