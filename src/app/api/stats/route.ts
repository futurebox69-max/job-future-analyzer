import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const total = await redis.get<number>("stats:total");
    return NextResponse.json({ total: total ?? 0 });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
