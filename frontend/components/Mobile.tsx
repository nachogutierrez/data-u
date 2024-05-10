"use client";

import useWindowDimensions from '@/hooks/useWindowDimensions'
import React from 'react'

export default function Mobile({ children }: { children: any }) {
    const { width, height } = useWindowDimensions()
    
    if (width > 500) {
        return <></>
    }

    return <>{children}</>
}
