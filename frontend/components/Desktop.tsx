"use client";

import useWindowDimensions from '@/hooks/useWindowDimensions'
import React from 'react'

export default function Desktop({ children }: { children: any }) {
    const { width, height } = useWindowDimensions()
    
    if (width <= 500) {
        return <></>
    }

    return <>{children}</>
}
