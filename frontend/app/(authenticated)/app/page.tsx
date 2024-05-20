import React from 'react';
import Page from '@/components/Page';
import { getDataPointsLatest, getInsightsLatest } from '@/db/bigquery/client';
import DataPointsTable from '@/components/table/DataPointsTable';
import DataPointsTableFilters from '@/components/table/DataPointsTableFilters';
import { validateSearchParams, extractFilters } from '@/lib/validation';
import DataPointsTableStatistics from '@/components/table/DataPointsTableStatistics';

type AppPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function AppPage(props: AppPageProps) {
  // Validate search params
  validateSearchParams(props.searchParams);

  // Fetch secrets
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY!

  // Extract filters from search params
  const filters = await extractFilters(props.searchParams);

  // Fetch data points
  const data = await getDataPointsLatest(filters);
  const insights = await getInsightsLatest(filters);

  return (
    <Page>
      <DataPointsTableFilters googleMapsApiKey={googleMapsApiKey} />
      <DataPointsTableStatistics insights={insights!} />
      <DataPointsTable data={data} insights={insights!}></DataPointsTable>
    </Page>
  );
}
