"use client";

import React from 'react'
import Link from 'next/link'

import SessionButton from '@/components/navbar/SessionButton';
import Navbar, { linkClassNames } from '@/components/navbar/Navbar';
import HomewatchLogo from '@/components/navbar/HomewatchLogo';
import { usePathname } from 'next/navigation';

export default function AppNavbar() {
    const pathname = usePathname()

    return (
        <Navbar>
            <div className="left">
                <Link href={'/app'}><HomewatchLogo /></Link>
                <Link href={'/app'} className={linkClassNames(pathname, '/app')}>Dashboard</Link>
                <Link href={'/app/charts'} className={linkClassNames(pathname, '/app/charts')}>Charts</Link>
            </div>

            <div className="right">
                <SessionButton />
            </div>
        </Navbar>
    )
}