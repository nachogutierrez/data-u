import React from 'react';
import Image from 'next/image';
import { timeAgo } from '@/lib/utils';
import { DataPoint } from '@/db/bigquery/types';

type TableRowProps = {
    row: DataPoint;
    isMobile?: boolean;
};

const LogoTableCell = ({ link }: { link: string }) => (
    <td className="px-6 py-4 flex justify-start">
        <a href={link} target="_blank" rel="noopener noreferrer">
            <Image
                src={`/logo/r3m4x.png`}
                width={24}
                height={24}
                alt='logo'
                className="transition-transform duration-100 ease-in-out transform hover:scale-110"
            />
        </a>
    </td>
)

const TableCell = ({ value }: { value: string | number }) => <td className="py-4 px-6 select-none">{value}</td>

const TableRow: React.FC<TableRowProps> = ({ row, isMobile = false }) => {

    const logoCell = <LogoTableCell link={row.link} />
    const titleCell = <TableCell value={row.title} />
    const priceCell = <TableCell value={`${row.price} ${row.currency.toUpperCase()}`} />
    const dimensionCell = <TableCell value={row.dimension_covered_m2!} />
    const operationCell = <TableCell value={row.operation} />
    const typeCell = <TableCell value={row.type} />
    const pricePerM2Cell = <TableCell value={`${(row.price / row.dimension_covered_m2!).toFixed(2)} ${row.currency.toUpperCase()}`} />
    const priceDownsCell = <TableCell value={row.last_30d_price_downs!} />
    const deltaPriceCell = <TableCell value={`${(row.last_30d_delta_price as any * 100).toFixed(2)}%`} />
    const firstSeenCell = <TableCell value={timeAgo(row.first_seen?.value)} />
    const lastSeen = <TableCell value={timeAgo(row.timestamp?.value)} />

    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition-all duration-100 ease-in-out hover:bg-gray-700 cursor-pointer">
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
