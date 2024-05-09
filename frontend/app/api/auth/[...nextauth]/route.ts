import { NextRequest } from "next/server";
import { getNextAuth } from "@/auth";

export async function GET(req: NextRequest) {
    return (await getNextAuth()).handlers.GET(req)
}

export async function POST(req: NextRequest) {
    return (await getNextAuth()).handlers.POST(req)
}