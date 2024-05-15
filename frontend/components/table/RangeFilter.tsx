"use client";

import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'

type RangeFilterProps = {
    name: string,
    minQueryParameterName: string,
    maxQueryParameterName: string,
    min: number,
    max: number,
    filterIndex?: number,
    filterState?: any,
    setFilterState?: any,
    onFilterChange?: any,
    isTransitionPending?: boolean
}

export default function RangeFilter(props: RangeFilterProps) {

    const {
        name,
        minQueryParameterName,
        maxQueryParameterName,
        filterIndex,
        filterState,
        setFilterState = () => { },
        onFilterChange = () => { },
        isTransitionPending
    } = props

    const searchParams = useSearchParams()

    const from = filterState?.from || ''
    const to = filterState?.to || ''

    const setFrom = (value: any) => {
        const newFilterState = {} as any
        if (to) newFilterState.to = to
        if (value) newFilterState.from = value
        setFilterState(newFilterState)
    }

    const setTo = (value: any) => {
        const newFilterState = {} as any
        if (from) newFilterState.from = from
        if (value) newFilterState.to = value
        setFilterState(newFilterState)
    }

    // Initialize filter state from query parameters
    useEffect(() => {
        let initialFrom = searchParams.get(minQueryParameterName) || ''
        let initialTo = searchParams.get(maxQueryParameterName) || ''

        setFilterState({
            from: initialFrom,
            to: initialTo
        })

        onFilterChange({
            filterIndex,
            displayName: initialFrom || initialTo ? [initialFrom, name, initialTo].filter(x => x).join(' <= ') : undefined,
            queryParameters: {
                [minQueryParameterName]: `${initialFrom}`,
                [maxQueryParameterName]: `${initialTo}`
            }
        })
    }, [])

    const updateFilterQuery = () => {
        onFilterChange({
            filterIndex,
            displayName: from || to ? [from, name, to].filter(x => x).join(' <= ') : undefined,
            queryParameters: {
                [minQueryParameterName]: `${from}`,
                [maxQueryParameterName]: `${to}`
            }
        })
    }

    const onKey = (key: string, f: any) => (e: any) => {
        if (e.key === key) {
            f()
        }
    }

    const clearFilter = () => {
        setFilterState({
            from: '',
            to: ''
        })

        onFilterChange({
            filterIndex,
            displayName: undefined,
            queryParameters: {
                [minQueryParameterName]: '',
                [maxQueryParameterName]: ''
            }
        })
    }

    return (
        <div
            className="p-2 rounded-md m-0 select-none">
            <p>{name}</p>
            <div className="flex gap-4 items-center">
                <div style={{ borderWidth: '1px' }}
                    className="relative overflow-hidden border-black border-solid rounded-md">
                    <input type="text" placeholder='From'
                        className={`p-2 outline-none ${isTransitionPending ? "bg-gray-300" : "bg-inherit"}`}
                        style={{ width: '102px' }}
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        onKeyDown={onKey('Enter', updateFilterQuery)}
                        onBlur={updateFilterQuery}
                        disabled={isTransitionPending} />

                    {isTransitionPending && (
                        <div className="absolute right-1/2 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                            <div className="spinner border-t-transparent border-solid border-white border-4 rounded-full w-5 h-5"></div>
                        </div>
                    )}
                </div>
                <div style={{ borderWidth: '1px' }}
                    className="relative overflow-hidden border-black border-solid rounded-md">
                    <input type="text" placeholder='To'
                        className={`p-2 outline-none ${isTransitionPending ? "bg-gray-300" : "bg-inherit"}`}
                        style={{ width: '102px' }}
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        onKeyDown={onKey('Enter', updateFilterQuery)}
                        onBlur={updateFilterQuery}
                        disabled={isTransitionPending} />
                    {isTransitionPending && (
                        <div className="absolute right-1/2 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                            <div className="spinner border-t-transparent border-solid border-white border-4 rounded-full w-5 h-5"></div>
                        </div>
                    )}
                </div>
                <button onClick={clearFilter} disabled={isTransitionPending}>Clear</button>
            </div>
        </div>
    )
}
