import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { onboardingSchema } from "@/lib/validations";
import { updateCustomerProfile } from "@/lib/customer-db";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    // Use phone as the key for customer lookup
    await updateCustomerProfile(parsed.data.phoneNumber, {
      name: parsed.data.name,
      email: session.user.email,
      favoriteCoffee: parsed.data.favoriteCoffee || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[onboarding] Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
