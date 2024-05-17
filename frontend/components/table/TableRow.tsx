import React from 'react';
import Image from 'next/image';
import { timeAgo } from '@/lib/utils';
import { BoxPlotDataPoint, DataPoint, Insights } from '@/db/bigquery/types';
import { formatMoney } from '@/lib/format';

type TableRowProps = {
    row: DataPoint;
    isMobile?: boolean;
    insights: Insights
};

function getLogo(host: string) {
    switch(host) {
        case 'remax':
            return '/logo/r3m4x.png'
        case 'zonaprop':
            return '/logo/z0n4pr0p.png'
        default:
            return ''
    }
}

const LogoTableCell = ({ host, link }: { host: string, link: string }) => (
    <td className="px-6 py-4 flex justify-start">
        <a href={link} target="_blank" rel="noopener noreferrer">
            <Image
                src={getLogo(host)}
                width={24}
                height={24}
                alt='logo'
                className="transition-transform duration-100 ease-in-out transform hover:scale-110"
            />
        </a>
    </td>
)

const TableCell = ({ value, backgroundColor }: { value: string | number, backgroundColor?: string }) => (
    <td className="py-4 px-6 select-none" style={{ backgroundColor }}>{value}</td>
)

export const COLOR_OUTLIER_LOW = 'gray'
export const COLOR_VERY_LOW = '#99CC6666'
export const COLOR_LOW = '#FFCC6666'
export const COLOR_HIGH = '#FF996666'
export const COLOR_VERY_HIGH = '#FF666666'
export const COLOR_OUTLIER_HIGH = 'gray'

const TableRow: React.FC<TableRowProps> = ({ row, isMobile = false, insights }) => {

    function getColor(value: number, stats: BoxPlotDataPoint) {
        const iqr = stats.q3 - stats.q1
        const brLeft = stats.q1 - 1.5*iqr
        const brRight = stats.q3 + 1.5*iqr
        if (value <= brLeft) {
            return COLOR_OUTLIER_LOW
        } else if (value >= brRight) {
            return COLOR_OUTLIER_HIGH
        } else if (value <= stats.q1) {
            return COLOR_VERY_LOW
        } else if (value >= stats.q3) {
            return COLOR_VERY_HIGH
        } else if (value <= stats.median) {
            return COLOR_LOW
        } else {
            return COLOR_HIGH
        }
    }

    const logoCell = <LogoTableCell host={row.host} link={row.link} />
    const titleCell = <TableCell value={row.title} />
    const priceCell = <TableCell value={formatMoney(row.price, row.currency)} backgroundColor={getColor(row.price, insights.price)} />
    const dimensionCell = <TableCell value={row.dimension_covered_m2!} />
    const operationCell = <TableCell value={row.operation} />
    const typeCell = <TableCell value={row.type} />
    const pricePerM2Cell = <TableCell value={formatMoney(row.price / row.dimension_covered_m2!, 'usd')} backgroundColor={getColor(row.price / row.dimension_covered_m2!, insights.price_m2)}/>
    const priceDownsCell = <TableCell value={row.last_30d_price_downs!} />
    const deltaPriceCell = <TableCell value={`${(row.last_30d_delta_price as any * 100).toFixed(2)}%`} />
    const firstSeenCell = <TableCell value={timeAgo(row.first_seen?.value)} />
    const lastSeen = <TableCell value={timeAgo(row.timestamp?.value)} />

    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition-all duration-100 ease-in-out hover:bg-gray-700 hover:text-white cursor-pointer">
            {isMobile && (
                <>
                    {logoCell}
                    {titleCell}
                    {priceCell}
                    {dimensionCell}
                </>
            )}
            {!isMobile && (
                <>
                    {logoCell}
                    {titleCell}
                    {operationCell}
                    {typeCell}
                    {priceCell}
                    {pricePerM2Cell}
                    {dimensionCell}
                    {priceDownsCell}
                    {deltaPriceCell}
                    {firstSeenCell}
                    {lastSeen}
                </>
            )}
        </tr>
    );
}

export default TableRow;
