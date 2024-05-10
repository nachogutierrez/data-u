"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import SessionButton from '@/components/session/SessionButton';

export default function Navbar() {
    return (
        <nav className="w-full">
            <div className="left">
                <Link href={'/app/welcome'}>
                    <Image
                        className='rounded-full'
                        width={64}
                        height={64}
                        src={'/logo/homewatch.png'}
                        alt={'HomeWatch'}
                        priority={true}></Image>
                </Link>
            </div>

            <div className="right">
                <SessionButton></SessionButton>
            </div>
        </nav>
    )
}