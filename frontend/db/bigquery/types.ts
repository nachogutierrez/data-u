import { BigQueryTimestamp, Geography } from "@google-cloud/bigquery"

export type Coordinate = {
    lat: number,
    lng: number
}

export type Filter = {
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

export type Filters = {
    // Required
    pagination: Pagination,
    sort: OrderBy,

    // Optional
    polygon?: Coordinate[],
    price?: Filter,
    priceM2?: Filter,
    dimensionCovered?: Filter,
}

export type DataPoint = {
    // Required
    id: string,
    internal_id: string,
    timestamp: BigQueryTimestamp,
    title: string,
    host: string,
    price: number,
    currency: string,
    operation: string,
    address: string,
    location: Geography,
    link: string,

    // Optional
    dimension_total_m2?: number,
    dimension_covered_m2?: number
}