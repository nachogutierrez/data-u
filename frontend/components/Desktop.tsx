"use client";

import useEnvironment, { Environment } from '@/hooks/useEnvironment';
import React from 'react'

export default function Desktop({ children }: { children: any }) {
    const environment = useEnvironment()
    
    if (environment === Environment.MOBILE) {
        return <></>
    }

    return <>{children}</>
}
