import React from 'react';
import Image from 'next/image';
import { timeAgo } from '@/lib/utils';
import { DataPoint } from '@/db/bigquery/types';

type TableRowProps = {
    row: DataPoint;
    isMobile?: boolean;
};

const TableRow: React.FC<TableRowProps> = ({ row, isMobile = false }) => (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition-all duration-100 ease-in-out hover:bg-gray-700 cursor-pointer">
        <td className="px-6 py-4 flex justify-start">
            <a href={row.link} target="_blank" rel="noopener noreferrer">
                <Image
                    src={`/logo/r3m4x.png`}
                    width={24}
                    height={24}
                    alt='logo'
                    className="transition-transform duration-100 ease-in-out transform hover:scale-110"
                />
            </a>
        </td>
        <td className="py-4 px-6 select-none">{row.title}</td>
        <td className="py-4 px-6 select-none">{row.price} {row.currency.toUpperCase()}</td>
        <td className="py-4 px-6 select-none">{row.dimension_covered_m2}</td>
        {!isMobile && (
            <>
                <td className="py-4 px-6 select-none">{row.operation}</td>
                <td className="py-4 px-6 select-none">{row.type}</td>
                <td className="py-4 px-6 select-none">{(row.price / row.dimension_covered_m2!).toFixed(2)} {row.currency.toUpperCase()}</td>
                <td className="py-4 px-6 select-none">{row.last_30d_price_downs}</td>
                <td className="py-4 px-6 select-none">{(row.last_30d_delta_price as any * 100).toFixed(2)}%</td>
                <td className="py-4 px-6 select-none">{timeAgo(row.first_seen?.value)}</td>
                <td className="py-4 px-6 select-none">{timeAgo(row.timestamp?.value)}</td>
            </>
        )}
    </tr>
);

export default TableRow;
