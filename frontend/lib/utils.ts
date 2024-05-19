// utils.ts
export function timeAgo(dateString: any) {
    if (!dateString || isNaN(Date.parse(dateString))) {
        return 'just now';
    }

    const date: any = new Date(dateString);
    const now: any = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const units = [
        { name: "y", seconds: 31536000 },
        { name: "mo", seconds: 2592000 },
        { name: "d", seconds: 86400 },
        { name: "h", seconds: 3600 },
        { name: "m", seconds: 60 },
        { name: "s", seconds: 1 },
    ];

    for (const unit of units) {
        const amount = Math.floor(diffInSeconds / unit.seconds);
        if (amount >= 1) {
            return `${amount}${unit.name} ago`;
        }
    }

    return 'just now';
}

export async function measure(label: string, f: any) {
    const start = Date.now()
    const response = await f()
    const elapsedMillis = Date.now() - start
    console.log(`${label}: ${elapsedMillis}ms`)
    return response
}