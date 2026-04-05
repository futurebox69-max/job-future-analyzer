import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    jobKey: process.env.JOB_ANALYZER_API_KEY
      ? `${process.env.JOB_ANALYZER_API_KEY.substring(0, 15)}...`
      : "not set",
    hasUpstash: !!process.env.UPSTASH_REDIS_REST_URL,
    envKeys: Object.keys(process.env).filter(
      (k) => k.includes("JOB_ANALYZER") || k.includes("UPSTASH") || k.includes("NEXT_PUBLIC")
    ),
  });
}
