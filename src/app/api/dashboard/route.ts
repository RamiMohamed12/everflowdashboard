import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Example protected dashboard data
  const dashboardData = {
    user: userId,
    totalProfit: 45000,
    offersWithProfit: 12,
    affiliatesWithProfit: 8,
    ecpa: 25.30,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(dashboardData);
}
