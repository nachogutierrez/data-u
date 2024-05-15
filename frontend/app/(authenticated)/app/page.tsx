import React from 'react';
import Page from '@/components/Page';
import { getSecret } from '@/secret-manager';
import { getDataPointsLatest } from '@/db/bigquery/client';
import DataPointsTable from '@/components/table/DataPointsTable';
import DataPointsTableFilters from '@/components/table/DataPointsTableFilters';
import { validateSearchParams, extractFilters } from '@/lib/validation';

type AppPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function AppPage(props: AppPageProps) {
  // Validate search params
  validateSearchParams(props.searchParams);

  // Fetch secrets
  const googleMapsApiKey = await getSecret('GOOGLE_MAPS_API_KEY');

  // Extract filters from search params
  const filters = await extractFilters(props.searchParams);

  // Fetch data points
  const data = await getDataPointsLatest(filters);

  return (
    <Page>
      <DataPointsTableFilters googleMapsApiKey={googleMapsApiKey} />
      <DataPointsTable data={data}></DataPointsTable>
    </Page>
  );
}
