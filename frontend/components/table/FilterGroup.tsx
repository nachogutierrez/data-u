"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react'

type FilterGroupProps = {
    children: any
}

export default function FilterGroup(props: FilterGroupProps) {

    const { children } = props

    const pathname = usePathname()
    const [isTransitionPending, startTransition] = useTransition();
    const router = useRouter()
    const searchParams = useSearchParams()


    function changeQueryParams(deltaSearchQueryParameters: any) {

        let newSearchQueryParameters: any = { ...deltaSearchQueryParameters }
        
        for (let paramKey of Array.from(searchParams.keys())) {
            if (paramKey in deltaSearchQueryParameters) continue
            if (searchParams.get(paramKey)!.length === 0) continue
            newSearchQueryParameters[paramKey] = searchParams.get(paramKey)
        }

        newSearchQueryParameters = Object.keys(newSearchQueryParameters).filter(key => newSearchQueryParameters[key]).map(key => ({ [key]: newSearchQueryParameters[key] })).reduce((a,b) => ({ ...a,...b }), {})

        const newQueryParamString = Object.keys(newSearchQueryParameters).map(key => `${key}=${newSearchQueryParameters[key]}`).sort().join('&')

        startTransition(() => {
            router.push(`${pathname}?${newQueryParamString}`)
        })
    }

    return (
        <>
            {React.Children.map(children, child => (
                React.cloneElement(child, {
                    changeQueryParams,
                    isTransitionPending
                })
            ))}
        </>
    )
}
