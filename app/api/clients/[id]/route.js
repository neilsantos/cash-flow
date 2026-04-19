import { NextResponse } from "next/server";
import { deleteClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return NextResponse.json({ clients: deleteClient(Number(id)) });
}
