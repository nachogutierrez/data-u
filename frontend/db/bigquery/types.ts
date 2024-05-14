import { BigQueryTimestamp, Geography } from "@google-cloud/bigquery"

export type Coordinate = {
    lat: number,
    lng: number
}

export type RangeFilter = {
    min?: number,
    max?: number
}

export enum OrderByOption { PRICE, PRICE_M2, DIMENSION_COVERED_M2 }
export enum OrderByDirection { ASC, DESC }

export type OrderBy = {
    option: OrderByOption,
    direction: OrderByDirection
}

export type Pagination = {
    pageSize: number,
    pageNumber: number
}

export enum Operation { SALE, RENT }
export enum PropertyType { HOUSE, APARTMENT, RURAL, COMMERCIAL, PARKING, LAND }

export type Filters = {
    // Required
    pagination: Pagination,
    sort: OrderBy,

    // Optional
    polygon?: Coordinate[],
    price?: RangeFilter,
    priceM2?: RangeFilter,
    priceDowns?: RangeFilter,
    priceDelta?: RangeFilter,
    dimensionCovered?: RangeFilter,
    operation?: Operation,
    type?: PropertyType
}

export type DataPoint = {
    // Required
    id: string,
    internal_id: string,
    type: string,
    timestamp: BigQueryTimestamp,
    title: string,
    host: string,
    price: number,
    currency: string,
    operation: string,
    address: string[],
    photos: string[],
    location: Geography,
    link: string,

    // Optional
    dimension_total_m2?: number,
    dimension_covered_m2?: number,
    last_30d_price_downs?: number,
    last_30d_delta_price?: number,
    first_seen?: BigQueryTimestamp
}