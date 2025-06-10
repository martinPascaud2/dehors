import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const result = "cron";
  console.log(result);

  return NextResponse.json({ data: result });
}
