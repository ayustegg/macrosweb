import { NextRequest, NextResponse } from "next/server";
import { searchFoods } from "@/features/foods/queries";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query?.trim()) {
    return NextResponse.json({ foods: [], offAvailable: true });
  }

  try {
    const result = await searchFoods(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json(
      { error: "Error al buscar alimentos" },
      { status: 500 }
    );
  }
}
