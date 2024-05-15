import { Filters, Operation, OrderByDirection, OrderByOption, PropertyType } from '@/db/bigquery/types';
import { runQuery as runNominatimQuery } from '@/lib/nominatim';

const integerRegex = /^[1-9][0-9]*|0$/;
const floatRegex = /^[0-9]+\.[0-9]{2}$/;
const locationQueryRegex = /^[a-zA-Z ,]+$/;

export function validateIsIntegerInRange(name: string, value: string, min?: number, max?: number) {
  if (value === undefined) return;

  if (!value.match(integerRegex)) {
    throw new Error(`Expected '${name}' to be an integer. Got '${value}'`);
  }
  const intValue = Number(value);

  if (min !== undefined && intValue < min) {
    throw new Error(`Expected '${name}' to be at least ${min}. Got '${value}'`);
  }

  if (max !== undefined && intValue > max) {
    throw new Error(`Expected '${name}' to be at most ${max}. Got '${value}'`);
  }
}

export function validateIsFloatInRange(name: string, value: string, min?: number, max?: number) {
  if (value === undefined) return;

  if (!value.match(floatRegex)) {
    throw new Error(`Expected '${name}' to be a float. Got '${value}'`);
  }
  const floatValue = parseFloat(value);

  if (min !== undefined && floatValue < min) {
    throw new Error(`Expected '${name}' to be at least ${min}. Got '${value}'`);
  }

  if (max !== undefined && floatValue > max) {
    throw new Error(`Expected '${name}' to be at most ${max}. Got '${value}'`);
  }
}

export function validateIntegerDifference(nameA: string, nameB: string, valueA: string, valueB: string) {
  if (valueA === undefined || valueB === undefined) return;

  const a = Number(valueA);
  const b = Number(valueB);

  if (a > b) {
    throw new Error(`Expected ${nameA} to be lower than or equal to ${nameB}`);
  }
}

export function validateIsEnum(name: string, value: string, enumType: any) {
  if (value === undefined) return;

  const num = Number(value);

  if (!Object.values(enumType).includes(num)) {
    throw new Error(`Invalid value '${value}' for ${name}`);
  }
}

export function validateLocationQuery(name: string, value: string) {
  if (value === undefined) return;

  const decoded = Buffer.from(value, 'base64').toString('utf-8');

  if (decoded.length === 0) {
    throw new Error(`Location query can't be empty.`);
  }

  if (!decoded.match(locationQueryRegex)) {
    throw new Error(`Expected ${name} to match regex ${locationQueryRegex}. Make sure ${name} is base64-encoded.`);
  }

  if (decoded.length > 100) {
    throw new Error(`Location query can't be more than 100 characters long. Got ${decoded.length} characters.`);
  }
}

export function validateSearchParams(params: { [key: string]: string | string[] | undefined } | undefined) {
  validateIsIntegerInRange('ps', params?.ps as string, 1, 100);
  validateIsIntegerInRange('p', params?.p as string, 0, 500000);
  validateIsIntegerInRange('minp', params?.minp as string, 1, 999999999);
  validateIsIntegerInRange('maxp', params?.maxp as string, 1, 999999999);
  validateIsIntegerInRange('minpsm', params?.minpsm as string, 1, 999999);
  validateIsIntegerInRange('maxpsm', params?.maxpsm as string, 1, 999999);
  validateIsIntegerInRange('mindc', params?.mindc as string, 1, 999999999);
  validateIsIntegerInRange('maxdc', params?.maxdc as string, 1, 999999999);
  validateIsIntegerInRange('obo', params?.obo as string, 0, undefined); // Enum values
  validateIsIntegerInRange('obd', params?.obd as string, 0, undefined); // Enum values
  validateIsIntegerInRange('minpdo', params?.minpdo as string, 0, undefined);
  validateIsIntegerInRange('maxpdo', params?.maxpdo as string, 0, undefined);
  validateIsFloatInRange('minpde', params?.minpde as string, 0, undefined);
  validateIsFloatInRange('maxpde', params?.maxpde as string, 0, undefined);

  validateIntegerDifference('minp', 'maxp', params?.minp as string, params?.maxp as string);
  validateIntegerDifference('minpsm', 'maxpsm', params?.minpsm as string, params?.maxpsm as string);
  validateIntegerDifference('mindc', 'maxdc', params?.mindc as string, params?.maxdc as string);

  validateIsEnum('obo', params?.obo as string, OrderByOption);
  validateIsEnum('obd', params?.obd as string, OrderByDirection);
  validateIsEnum('t', params?.t as string, PropertyType);
  validateIsEnum('op', params?.op as string, Operation);

  validateLocationQuery('q', params?.q as string);
}

export function isN(value: any) {
  return typeof value === 'number' && !isNaN(value);
}

export async function extractFilters(params: { [key: string]: string | string[] | undefined } | undefined): Promise<Filters> {
  const locationQueryBase64 = params?.q as string;
  const pageSize = Number(params?.ps) || 100;
  const pageNumber = Number(params?.p) || 0;
  const minPrice = Number(params?.minp);
  const maxPrice = Number(params?.maxp);
  const minPriceM2 = Number(params?.minpsm);
  const maxPriceM2 = Number(params?.maxpsm);
  const minDimensionCovered = Number(params?.mindc);
  const maxDimensionCovered = Number(params?.maxdc);
  const minPriceDowns = Number(params?.minpdo);
  const maxPriceDowns = Number(params?.maxpdo);
  const minPriceDelta = parseFloat(params?.minpde as any);
  const maxPriceDelta = parseFloat(params?.maxpde as any);
  const orderByOption = OrderByOption[OrderByOption[Number(params?.obo)] as keyof typeof OrderByOption] || OrderByOption.PRICE_M2;
  const orderByDirection = OrderByDirection[OrderByDirection[Number(params?.obo)] as keyof typeof OrderByDirection] || OrderByDirection.ASC;
  const type = PropertyType[PropertyType[Number(params?.t)] as keyof typeof PropertyType];
  const operation = Operation[Operation[Number(params?.op)] as keyof typeof Operation];
  let mapPolygon = undefined;

  if (locationQueryBase64 !== undefined) {
    const decodedLocationQuery = Buffer.from(locationQueryBase64, 'base64').toString('utf-8');
    const { polygon } = await runNominatimQuery(decodedLocationQuery);
    mapPolygon = polygon;
  }

  const maybe = (predicate: any, name: string, value: any) => (predicate() ? { [name]: value } : {});

  const filters: Filters = {
    ...maybe(() => mapPolygon, 'polygon', mapPolygon),
    ...maybe(() => isN(minPrice) || isN(maxPrice), 'price', { ...maybe(() => isN(minPrice), 'min', minPrice), ...maybe(() => isN(maxPrice), 'max', maxPrice) }),
    ...maybe(() => isN(minPriceDowns) || isN(maxPriceDowns), 'priceDowns', { ...maybe(() => isN(minPriceDowns), 'min', minPriceDowns), ...maybe(() => isN(maxPriceDowns), 'max', maxPriceDowns) }),
    ...maybe(() => isN(minPriceDelta) || isN(maxPriceDelta), 'priceDelta', { ...maybe(() => isN(minPriceDelta), 'min', minPriceDelta), ...maybe(() => isN(maxPriceDelta), 'max', maxPriceDelta) }),
    ...maybe(() => isN(minPriceM2) || isN(maxPriceM2), 'priceM2', { ...maybe(() => isN(minPriceM2), 'min', minPriceM2), ...maybe(() => isN(maxPriceM2), 'max', maxPriceM2) }),
    ...maybe(() => isN(minDimensionCovered) || isN(maxDimensionCovered), 'dimensionCovered', { ...maybe(() => isN(minDimensionCovered), 'min', minDimensionCovered), ...maybe(() => isN(maxDimensionCovered), 'max', maxDimensionCovered) }),
    ...maybe(() => type !== undefined, 'type', type),
    ...maybe(() => operation !== undefined, 'operation', operation),
    pagination: { pageNumber, pageSize },
    sort: {
      option: orderByOption,
      direction: orderByDirection,
    },
  };

  return filters;
}
