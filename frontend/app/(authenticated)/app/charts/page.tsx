import React from 'react'

import NewPostsChart from '@/components/charts/server/NewPostsChart';
import Page from '@/components/Page';

export default async function ChartsPage() {
  
  return (
    <Page>
      <div className="flex flex-wrap justify-around">
        <NewPostsChart />
      </div>
    </Page>
  )
}
