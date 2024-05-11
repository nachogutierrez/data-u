import { runQuery } from "@/lib/nominatim";
import { NextRequest, NextResponse } from "next/server";

// As per https://operations.osmfoundation.org/policies/nominatim/#requirements
const MAX_QPS = 1

// Used to throttle the endpoint
let lastCalled = 0

export async function GET(req: NextRequest) {

    const params = req.nextUrl.searchParams

    if (!params.has('q')) {
        return new NextResponse(`Request is missing required query parameter 'q'`, { status: 400 })
    }

    // TODO: sanitize?
    const locationQuery = params.get('q')!;

    // TODO: If in cache, return immediately

    const now = Date.now()
    if (now - lastCalled <= MAX_QPS*1000) {
        return new NextResponse(`Can't exceed more than ${MAX_QPS} QPS.`, { status: 429 })
    }
    lastCalled = now

    const results = await runQuery(locationQuery)

    return NextResponse.json(results)
}