"use client";

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useSession } from 'next-auth/react'
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import SessionButton from '../components/SessionButton';

export default function Navbar() {

    const { data: session, status } = useSession()
    const isLoading = status === 'loading'

    return (
        <nav>
            <div className="left">
                <Link href={'/'}>
                    <Image
                        className='rounded-full'
                        width={64}
                        height={64}
                        src={'/logo/homewatch.png'}
                        alt={'HomeWatch'}
                        priority={true}></Image>
                </Link>
                <Link href='/'>Products</Link>
                <Link href='/pricing'>Pricing</Link>
            </div>
            <div className="right">
                <SessionButton/>
            </div>
        </nav>
    )
}