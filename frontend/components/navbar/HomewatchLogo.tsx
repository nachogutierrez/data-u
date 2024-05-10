"use client";

import React from 'react'
import useEnvironment, { Environment } from '@/hooks/useEnvironment';
import Image from 'next/image';

export default function HomewatchLogo() {
    const environment = useEnvironment()
    
    return (
        <Image
            className='rounded-full'
            width={environment === Environment.DESKTOP ? 32 : 48}
            height={environment === Environment.DESKTOP ? 32 : 48}
            src={'/logo/homewatch.png'}
            alt={'HomeWatch'}
            priority={true}></Image>
    )
}
