"use client";

import useEnvironment, { Environment } from '@/hooks/useEnvironment';
import React, { useEffect, useRef, useState } from 'react'

type ExpandableFilterButtonProps = {
    name: string,
    children: any,
    openFromRight?: boolean,
    changeQueryParams?: any,
    isTransitionPending?: boolean
}

type FilterUpdate = {
    filterIndex: number,
    displayName: string,
    queryParameters: {}
}

export default function ExpandableFilterButton(props: ExpandableFilterButtonProps) {

    const { name, children, changeQueryParams, isTransitionPending, openFromRight = false } = props

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const [filterQueries, setFilterQueries] = useState(React.Children.map(children, () => ({})))
    const [filterStates, setFilterStates] = useState(React.Children.map(children, () => ({})))
    const environment = useEnvironment()

    const ref = useRef(null); // Ref for the button and dropdown container

    function getName() {
        const queryCount = filterQueries.map((x: any) => x.displayName).filter((x: any) => x).length
        if (queryCount === 0 || queryCount > 1) {
            return name
        } else {
            const query = filterQueries.find((x: any) => x.displayName)
            return query.displayName
        }
    }

    function getNotificationsCount() {
        const queryCount = filterQueries.map((x: any) => x.displayName).filter((x: any) => x).length
        return queryCount <= 1 ? 0 : queryCount
    }

    useEffect(() => {
        // Function to handle click outside
        const handleClickOutside = (event: any) => {
            if (ref.current && !(ref.current as any).contains(event.target)) {
                setIsOpen(false);
            }
        };

        // Add when the component mounts
        document.addEventListener("mousedown", handleClickOutside);

        // Return function to be called when the component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty array ensures this effect runs only once after mount


    function formatAllQueryParams() {
        return filterQueries
            .map((x: any) => x.queryParameters || {})
            .flatMap((obj: any) => (
                Object.keys(obj)
                    .filter(x => obj[x] && obj[x].length > 0)
                    .map(key => `${key}=${obj[key]}`)
            ))
            .sort()
            .join('&')
    }

    useEffect(() => {
        const newQueryParams = filterQueries.map((x: any) => x.queryParameters).reduce((a: any, b: any) => ({ ...a,...b }), {})
        changeQueryParams(newQueryParams)
    }, [formatAllQueryParams()])

    const handleFilterChange = (filterUpdate: FilterUpdate) => {
        const { filterIndex, displayName, queryParameters } = filterUpdate

        setFilterQueries((prev: any) => {
            const next = [...prev]

            next[filterIndex] = {
                displayName,
                queryParameters
            }

            return next
        })
    }

    let enhancedChildren = React.Children.map(children, (child, i) => {

        return (
            <div className='flex items-center'>
                <div>
                    {React.cloneElement(child, {
                        filterIndex: i,
                        filterState: filterStates[i],
                        setFilterState: (value: any) => setFilterStates((prev: any) => {
                            const next = [...prev]
                            next[i] = value || {}
                            return next
                        }),
                        onFilterChange: handleFilterChange,
                        isTransitionPending
                    })}
                </div>
            </div>
        )
    })

    function clearAllFilters() {
        setFilterStates(React.Children.map(children, () => ({})))
        setFilterQueries((prev: any) => {
            return prev.map((x: any) => ({
                queryParameters: Object.keys(x.queryParameters).map(key => ({ [key]: '' })).reduce((a, b) => ({ ...a, ...b }), {})
            }))
        })
    }

    return (
        <div ref={ref} className={environment === Environment.DESKTOP ? 'relative' : ''}>
            <div
                onClick={toggleDropdown}
                className="p-2 bg-white rounded-md m-0 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer border-black select-none flex"
                style={{ borderWidth: '1px' }}>
                <p>{getName()}</p>
                {getNotificationsCount() > 0 && (
                    <div className="ml-2 bg-orange-400 rounded-full flex justify-center items-center text-xs p-3 w-4 h-4">{getNotificationsCount()}</div>
                )}
            </div>
            <div
                className={`absolute flex flex-col bg-gray-200 p-2 rounded-md left-0 mt-2 transition-all duration-200 ease-in-out ${environment === Environment.DESKTOP ? 'origin-top-left' : 'origin-top w-full'} ${isOpen ? '' : `opacity-0 scale-0`}`}
                style={{ zIndex: 1000 }}>
                {enhancedChildren}

                <button
                    className="self-end"
                    onClick={clearAllFilters}
                    disabled={isTransitionPending}>
                    Clear Filters
                </button>
            </div>
        </div>
    )
}
