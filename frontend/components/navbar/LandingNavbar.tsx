"use client";

import React from 'react'
import Link from 'next/link'
import SessionButton from '@/components/navbar/SessionButton';
import Navbar, { linkClassNames } from '@/components/navbar/Navbar';
import HomewatchLogo from '@/components/navbar/HomewatchLogo';
import { usePathname } from 'next/navigation';

export default function LandingNavbar() {

    const pathname = usePathname()

    return (
        <Navbar>
            <div className="left">
                <Link href={'/'}><HomewatchLogo /></Link>
                <Link href='/' className={linkClassNames(pathname, '/')}>Home</Link>
                <Link href='/pricing' className={linkClassNames(pathname, '/pricing')}>Pricing</Link>
            </div>
            <div className="right">
                <SessionButton />
            </div>
        </Navbar>
    )
}