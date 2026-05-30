import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function getAuthUser() {
  try {
    const headersList = await headers();

    const authHeader = headersList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: number;
      account_type: string;
    };

    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
}