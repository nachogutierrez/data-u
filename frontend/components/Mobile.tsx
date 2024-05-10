"use client";

import useEnvironment, { Environment } from '@/hooks/useEnvironment';
import React from 'react'

export default function Mobile({ children }: { children: any }) {
    const environment = useEnvironment()
    
    if (environment === Environment.DESKTOP) {
        return <></>
    }

    return <>{children}</>
}
