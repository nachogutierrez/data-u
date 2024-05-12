"use client";

import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

type SelectFilterOption = {
    name: string,
    queryParameterValue: string
}

type SelectFilterProps = {
    name: string,
    queryParameterName: string,
    options: SelectFilterOption[],
    filterIndex?: number,
    filterState?: any,
    setFilterState?: any,
    onFilterChange?: any,
    isTransitionPending?: boolean
}

export default function SelectFilter(props: SelectFilterProps) {

    const {
        name,
        queryParameterName,
        options,
        filterIndex,
        filterState,
        setFilterState = () => { },
        onFilterChange = () => { },
        isTransitionPending
    } = props

    const searchParams = useSearchParams()

    const optionSelected = filterState?.optionSelected || ''
    const setOptionSelected = (value: any) => setFilterState({ optionSelected: value })

    // Initialize filter state from query parameters
    useEffect(() => {
        const initialOptionSelectedQueryParam = searchParams.get(queryParameterName) || ''

        const initialOptionSelected = options.find(x => x.queryParameterValue === initialOptionSelectedQueryParam)?.name

        setFilterState({
            optionSelected: initialOptionSelected
        })

        updateFilterQuery(initialOptionSelected)
    }, [])

    const updateFilterQuery = (value: any) => {

        const queryParamValue = options.find(x => x.name === value)?.queryParameterValue || ''

        onFilterChange({
            filterIndex,
            displayName: value || undefined,
            queryParameters: {
                [queryParameterName]: `${queryParamValue}`,
            }
        })
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
                [queryParameterName]: '',
            }
        })
    }

    function handleChange(value: any) {
        setOptionSelected(value)
        updateFilterQuery(value)
    }

    return (
        <div>
            <p>{name}</p>
            <div>
                {options.map((option, index) => (
                    <label key={index} className="inline-flex items-center space-x-2">
                        <input
                            type="radio"
                            name={name}
                            value={option.name}
                            checked={optionSelected === option.name}
                            onChange={() => handleChange(option.name)}
                            className="text-blue-500 focus:ring-blue-400 focus:outline-none"
                            disabled={isTransitionPending}/>
                        <span>{option.name}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
