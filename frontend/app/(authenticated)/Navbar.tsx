"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import SessionButton from '@/app/components/SessionButton';

export default function Navbar() {
    return (
        <nav>
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