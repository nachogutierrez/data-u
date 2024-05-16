import React from 'react';
import Desktop from '@/components/Desktop';
import Mobile from '@/components/Mobile';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

import { DataPoint, Insights } from '@/db/bigquery/types';

type DataPointsTableProps = {
    data: DataPoint[];
    insights: Insights
};

const desktopColumns = ["Source", "Title", "Operation", "Type", "Price", "Price per m2", "Dimension (m2)", "Price downs", "Price delta (%)", "First seen", "Last seen"];
const mobileColumns = ["Source", "Title", "Price", "Dimension (m2)"];

export default function DataPointsTable(props: DataPointsTableProps) {
    const { data, insights } = props;

    return (
        <>
            <Desktop>
                <div className={`shadow-md sm:rounded-lg`}>
                    <table className="relative w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <TableHeader columns={desktopColumns} />
                        <tbody>
                            {data.map((row, index) => (
                                <TableRow key={index} row={row} insights={insights} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Desktop>
            <Mobile>
                <div className={`shadow-md sm:rounded-lg overflow-x-hidden`}>
                    <table className="relative w-full text-sm text-left text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                        <TableHeader columns={mobileColumns} />
                        <tbody>
                            {data.map((row, index) => (
                                <TableRow key={index} row={row} insights={insights} isMobile />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Mobile>
        </>
    );
}
