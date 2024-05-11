import React from 'react';

import Page from '@/components/Page';
import { getSecret } from '@/secret-manager';
import PolygonMap from '@/components/maps/PolygonMap';
import { runQuery as runNominatimQuery } from '@/lib/nominatim';
import { getDataPointsLatest } from '@/db/bigquery/client';
import { Filters, OrderByDirection, OrderByOption } from '@/db/bigquery/types';
import DataPointsTable from '@/components/data/DataPointsTable';

type AppPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

const integerRegex = /^[1-9][0-9]*|0$/
const locationQueryRegex = /^[a-zA-Z ,]+$/

function validateIsIntegerInRange(name: string, value: string, min: number|undefined, max: number|undefined) {
  if (value === undefined) {
    return
  }

  if (!value.match(integerRegex)) {
    throw new Error(`Expected '${name}' to be an integer. Got '${value}'`)
  }
  const intValue = Number(value)

  if (min && intValue < min) {
    throw new Error(`Expected '${name}' to be at least ${min}. Got '${value}'`)
  }

  if (max &&intValue > max) {
    throw new Error(`Expected '${name}' to be at most ${max}. Got '${value}'`)
  }
}

function validateIntegerDifference(nameA: string, nameB: string, valueA: string, valueB: string) {
  if (valueA === undefined || valueB === undefined) {
    return
  }

  const a = Number(valueA)
  const b = Number(valueB)

  if (a > b) {
    throw new Error(`Expected ${nameA} to be lower than or equal to ${nameB}`)
  }
}

function validateIsEnum(name: string, value: string, enumType: any) {
  if (value === undefined) {
    return
  }

  const num = Number(value)

  if (!Object.values(enumType).includes(num)) {
    throw new Error(`Invalid value '${value}' for ${name}`)
  }
}

function validateLocationQuery(name: string, value: string) {
  if (value === undefined) {
    return
  }

  const decoded = Buffer.from(value, 'base64').toString('utf-8')

  if (!decoded.match(locationQueryRegex)) {
    throw new Error(`Expected ${name} to match regex ${locationQueryRegex} make sure ${name} is base64-encoded.`)
  }

  if (decoded.length === 0) {
    throw new Error(`Location query can't be empty.`)
  }

  if (decoded.length > 100) {
    throw new Error(`Location query can't be more than 100 characters long. Got ${decoded.length} characters.`)
  }
}

export default async function AppPage(props: AppPageProps) {

  // TODO: handle errors more gracefully

  validateIsIntegerInRange('ps', props.searchParams?.ps as string, 1, 100)
  validateIsIntegerInRange('p', props.searchParams?.p as string, 0, 500000)
  validateIsIntegerInRange('minp', props.searchParams?.minp as string, 1, 999999999)
  validateIsIntegerInRange('maxp', props.searchParams?.maxp as string, 1, 999999999)
  validateIsIntegerInRange('minpsm', props.searchParams?.minpsm as string, 1, 999999)
  validateIsIntegerInRange('maxpsm', props.searchParams?.maxpsm as string, 1, 999999)
  validateIsIntegerInRange('mindc', props.searchParams?.mindc as string, 1, 999999999)
  validateIsIntegerInRange('maxdc', props.searchParams?.maxdc as string, 1, 999999999)
  validateIsIntegerInRange('obo', props.searchParams?.obo as string, 0, undefined) // Enum values
  validateIsIntegerInRange('obd', props.searchParams?.obd as string, 0, undefined) // Enum values

  validateIntegerDifference('minp', 'maxp', props.searchParams?.minp as string, props.searchParams?.maxp as string)
  validateIntegerDifference('minpsm', 'maxpsm', props.searchParams?.minpsm as string, props.searchParams?.maxpsm as string)
  validateIntegerDifference('mindc', 'maxdc', props.searchParams?.mindc as string, props.searchParams?.maxdc as string)

  validateIsEnum('obo', props.searchParams?.obo as string, OrderByOption)
  validateIsEnum('obd', props.searchParams?.obd as string, OrderByDirection)

  validateLocationQuery('q', props.searchParams?.q as string)

  const googleMapsApiKey = await getSecret('GOOGLE_MAPS_API_KEY')

  const locationQueryBase64 = props.searchParams?.q as string
  const pageSize = Number(props.searchParams?.ps) || 100
  const pageNumber = Number(props.searchParams?.p) || 0
  const minPrice = Number(props.searchParams?.minp)
  const maxPrice = Number(props.searchParams?.maxp)
  const minPriceM2 = Number(props.searchParams?.minpsm)
  const maxPriceM2 = Number(props.searchParams?.maxpsm)
  const minDimensionCovered = Number(props.searchParams?.mindc)
  const maxDimensionCovered = Number(props.searchParams?.maxdc)
  const orderByOption = OrderByOption[OrderByOption[Number(props.searchParams?.obo)] as keyof typeof OrderByOption] || OrderByOption.PRICE_M2
  const orderByDirection = OrderByDirection[OrderByDirection[Number(props.searchParams?.obo)] as keyof typeof OrderByDirection] || OrderByDirection.ASC
  let mapPolygon = undefined

  if (locationQueryBase64 !== undefined) {
    const decodedLocationQuery = Buffer.from(locationQueryBase64, 'base64').toString('utf-8')
    const { polygon, boundingbox, center } = await runNominatimQuery(decodedLocationQuery)

    mapPolygon = polygon
  }

  const maybe = (predicate: any, name: string, value: any) => predicate() ? ({ [name]: value }) : ({})

  const filters: Filters = {
    ...maybe(() => mapPolygon, 'polygon', mapPolygon),
    ...maybe(() => minPrice || maxPrice, 'price', { ...maybe(() => minPrice, 'min', minPrice), ...maybe(() => maxPrice, 'max', maxPrice) }),
    ...maybe(() => minPriceM2 || maxPriceM2, 'priceM2', { ...maybe(() => minPriceM2, 'min', minPriceM2), ...maybe(() => maxPriceM2, 'max', maxPriceM2) }),
    ...maybe(() => minDimensionCovered || maxDimensionCovered, 'dimensionCovered', { ...maybe(() => minDimensionCovered, 'min', minDimensionCovered), ...maybe(() => maxDimensionCovered, 'max', maxDimensionCovered) }),
    pagination: { pageNumber, pageSize },
    sort: {
      option: orderByOption,
      direction: orderByDirection
    }
  }

  const data = await getDataPointsLatest(filters)

  return (
    <Page>
      <DataPointsTable data={data}></DataPointsTable>
      {/* <MapSearchButton googleMapsApiKey={googleMapsApiKey}></MapSearchButton> */}
      {/* <PolygonMap googleMapsApiKey={googleMapsApiKey} /> */}
    </Page>
  )
}
