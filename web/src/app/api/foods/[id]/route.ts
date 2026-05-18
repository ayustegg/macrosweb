import { NextRequest, NextResponse } from "next/server";
import { getFoodById } from "@/features/foods/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const food = await getFoodById(id);
  if (!food) {
    return NextResponse.json(
      { error: "Alimento no encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(food);
}
