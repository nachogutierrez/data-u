import { DataPoint } from '@/db/bigquery/types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Desktop from '../Desktop'
import Mobile from '../Mobile'

type DataPointsTableProps = {
    data: DataPoint[]
}

function timeAgo(dateString: any) {
    const date: any = new Date(dateString);
    const now: any = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const units = [
        { name: "y", seconds: 31536000 },
        { name: "mo", seconds: 2592000 },
        { name: "d", seconds: 86400 },
        { name: "h", seconds: 3600 },
        { name: "m", seconds: 60 },
        { name: "s", seconds: 1 },
    ];

    for (const unit of units) {
        const amount = Math.floor(diffInSeconds / unit.seconds);
        if (amount >= 1) {
            return `${amount}${unit.name} ago`;
        }
    }

    return 'just now';
}

export default function DataPointsTable(props: DataPointsTableProps) {

    const { data } = props

    return (
        <>
            <Desktop>
                <div className={`shadow-md sm:rounded-lg`}>
                    <table className="relative w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" style={{ zIndex: 1 }}>
                            <tr>
                                <th scope="col" className="py-3 px-6">Source</th>
                                <th scope="col" className="py-3 px-6">Title</th>
                                <th scope="col" className="py-3 px-6">Operation</th>
                                <th scope="col" className="py-3 px-6">Type</th>
                                <th scope="col" className="py-3 px-6">Price</th>
                                <th scope="col" className="py-3 px-6">Price per m2</th>
                                <th scope="col" className="py-3 px-6">Dimension (m2)</th>
                                <th scope="col" className="py-3 px-6">Price downs</th>
                                <th scope="col" className="py-3 px-6">Price delta (%)</th>
                                <th scope="col" className="py-3 px-6">First seen</th>
                                <th scope="col" className="py-3 px-6">Last seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition-all duration-100 ease-in-out hover:bg-gray-700 cursor-pointer">
                                    <td className="px-6">
                                        <div className="py-4 flex justify-start">
                                            <a href={row.link}>
                                                <Image
                                                    src={`/logo/r3m4x.png`}
                                                    width={24}
                                                    height={24}
                                                    alt='logo'
                                                    className="transition-transform duration-100 ease-in-out transform hover:scale-110" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 select-none">{row.title}</td>
                                    <td className="py-4 px-6 select-none">{row.operation}</td>
                                    <td className="py-4 px-6 select-none">{row.type}</td>
                                    <td className="py-4 px-6 select-none">{row.price} {row.currency.toUpperCase()}</td>
                                    <td className="py-4 px-6 select-none">{(row.price / row.dimension_covered_m2!).toFixed(2)} {row.currency.toUpperCase()}</td>
                                    <td className="py-4 px-6 select-none">{row.dimension_covered_m2}</td>
                                    <td className="py-4 px-6 select-none">{row.last_30d_price_downs}</td>
                                    <td className="py-4 px-6 select-none">{(row.last_30d_delta_price as any * 100).toFixed(2)}%</td>
                                    <td className="py-4 px-6 select-none">{timeAgo(row.first_seen?.value)}</td>
                                    <td className="py-4 px-6 select-none">{timeAgo(row.timestamp?.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Desktop>
            <Mobile>
                <div className={`shadow-md sm:rounded-lg overflow-x-hidden`}>
                    <table className="relative w-full text-sm text-left text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                        <thead className="sticky top-0 text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" style={{ zIndex: 1 }}>
                            <tr>
                                <th scope="col" className="py-1 px-3"><span className='invisible'>Sou</span></th>
                                <th scope="col" className="py-1 px-3">Title</th>
                                <th scope="col" className="py-1 px-3">Price</th>
                                <th scope="col" className="py-1 px-3">Dimension (m2)</th>
                                {/* <th scope="col" className="py-1 px-3">PDowns</th> */}
                                {/* <th scope="col" className="py-1 px-3">PDelta</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 transition-all duration-100 ease-in-out hover:bg-gray-700 cursor-pointer">
                                    <td className="px-3">
                                        <div className="py-2 flex justify-start">
                                            <a href={row.link} target="_blank" rel="noopener noreferrer">
                                                <Image
                                                    src={`/logo/r3m4x.png`}
                                                    width={24}
                                                    height={24}
                                                    alt='logo'
                                                    className="transition-transform duration-100 ease-in-out transform hover:scale-110" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 select-none">{row.title}</td>
                                    <td className="py-2 px-3 select-none no-underline">{row.price} {row.currency.toUpperCase()}</td>
                                    <td className="py-2 px-3 select-none no-underline">{row.dimension_covered_m2}</td>
                                    {/* <td className="py-4 px-6 select-none">{row.last_30d_price_downs}</td> */}
                                    {/* <td className="py-4 px-6 select-none">{(row.last_30d_delta_price as any * 100).toFixed(2)}%</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Mobile>
        </>
    );
}
