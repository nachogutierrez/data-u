import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
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
                <Link href='/login'>Login</Link>
            </div>
        </nav>
    )
}