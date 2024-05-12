"use client";

import React, { useState } from 'react'
import Link from 'next/link'

import SessionButton from '@/components/navbar/SessionButton';
import Navbar, { linkClassNames } from '@/components/navbar/Navbar';
import HomewatchLogo from '@/components/navbar/HomewatchLogo';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AppNavbar() {
    const pathname = usePathname()

    const searchParams = useSearchParams()

    const [locationQuery, setLocationQuery] = useState(searchParams.get('q') ? atob(searchParams.get('q') as string) : '');

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {

            // using router.push causes components to reuse cached state, full refresh is needed
            window.location.href = `/app?q=${btoa(locationQuery)}`
        }
    };

    return (
        <Navbar>
            <div className="left">
                <Link href={'/app'}><HomewatchLogo /></Link>
                <Link href={'/app'} className={linkClassNames(pathname, '/app')}>Dashboard</Link>
                <Link href={'/app/charts'} className={linkClassNames(pathname, '/app/charts')}>Charts</Link>
            </div>

            {/* <div className="center text-sm">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden pl-4 w-96">
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={e => setLocationQuery(e.target.value)}
                        placeholder="Search for a location..."
                        onKeyDown={handleKeyDown}
                        className="w-full p-1 outline-none bg-inherit" />
                    <button className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
                        Search
                    </button>
                </div>
            </div> */}

            <div className="right">
                <SessionButton />
            </div>
        </Navbar>
    )
}