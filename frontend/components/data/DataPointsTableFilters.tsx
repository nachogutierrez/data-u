"use client";

import React from 'react'
import RangeFilter from './RangeFilter';
import LocationFilter from './LocationFilter';
import EnumFilter from './SelectFilter';
import ExpandableFilterButton from './ExpandableFilterButton';
import FilterGroup from './FilterGroup';
import SelectFilter from './SelectFilter';
import { Operation, PropertyType } from '@/db/bigquery/types';
import Desktop from '../Desktop';
import Mobile from '../Mobile';

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

type DataPointsTableFiltersProps = {
    googleMapsApiKey: string
}

export default function DataPointsTableFilters(props: DataPointsTableFiltersProps) {

    const { googleMapsApiKey } = props

    let operationFilter = (
        <SelectFilter
            name='Operation'
            options={Object.keys(Operation).filter((key: any) => !isNaN(key)).map((key: any) => ({ name: capitalizeFirstLetter(Operation[key].toLowerCase()), queryParameterValue: key }))}
            queryParameterName='op' />
    )
    let typeFilter = (
        <SelectFilter
            name='Type'
            options={Object.keys(PropertyType).filter((key: any) => !isNaN(key)).map((key: any) => ({ name: capitalizeFirstLetter(PropertyType[key].toLowerCase()), queryParameterValue: key }))}
            queryParameterName='t' />
    )
    let priceFilter = (
        <RangeFilter
            name='Price'
            minQueryParameterName='minp'
            maxQueryParameterName='maxp'
            min={1}
            max={999999999} />
    )
    let priceM2Filter = (
        <RangeFilter
            name='Price per m2'
            minQueryParameterName='minpsm'
            maxQueryParameterName='maxpsm'
            min={1}
            max={999999999} />
    )
    let dimensionFilter = (
        <RangeFilter
            name='Dimension Covered'
            minQueryParameterName='mindc'
            maxQueryParameterName='maxdc'
            min={1}
            max={999999999} />
    )
    let priceDownsFilter = (
        <RangeFilter
            name='Price downs'
            minQueryParameterName='minpdo'
            maxQueryParameterName='maxpdo'
            min={0}
            max={100} />
    )
    let priceDeltaFilter = (
        <RangeFilter
            name='Price delta'
            minQueryParameterName='minpde'
            maxQueryParameterName='maxpde'
            min={0}
            max={100} />
    )

    return (
        <div className="relative">
            <div className="flex items-center gap-4 pl-4 pt-2 pb-2 sticky top-0 z-10 bg-white">
                <Desktop>
                    <FilterGroup>
                        <LocationFilter googleMapsApiKey={googleMapsApiKey} />
                        <ExpandableFilterButton name='Operation'>
                            {operationFilter}
                        </ExpandableFilterButton>
                        <ExpandableFilterButton name='Type'>
                            {typeFilter}
                        </ExpandableFilterButton>
                        <ExpandableFilterButton name='Prices'>
                            {priceFilter}
                            {priceM2Filter}
                            {priceDownsFilter}
                            {priceDeltaFilter}
                        </ExpandableFilterButton>
                        <ExpandableFilterButton name='Dimensions'>
                            {dimensionFilter}
                        </ExpandableFilterButton>
                    </FilterGroup>
                </Desktop>
                <Mobile>
                    <FilterGroup>
                        <LocationFilter googleMapsApiKey={googleMapsApiKey} />
                        <ExpandableFilterButton name='More Filters'>
                            {operationFilter}
                            {typeFilter}
                            {priceFilter}
                            {priceM2Filter}
                            {priceDownsFilter}
                            {priceDeltaFilter}
                            {dimensionFilter}
                        </ExpandableFilterButton>
                    </FilterGroup>
                </Mobile>
            </div>
        </div>
    )
}
