import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

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
                <Link href='/app/units'>Units</Link>
                <Link href='/app/profile'>Profile</Link>
            </div>

            <div className="right">

            </div>
        </nav>
    )
}