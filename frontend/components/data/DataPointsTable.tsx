import { DataPoint } from '@/db/bigquery/types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type DataPointsTableProps = {
    data: DataPoint[]
}

export default function DataPointsTable(props: DataPointsTableProps) {

    const { data } = props

    return (
        <div className="shadow-md sm:rounded-lg">
            <table className="relative w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="sticky top-0 z-10 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="py-3 px-6">Source</th>
                        <th scope="col" className="py-3 px-6">Title</th>
                        <th scope="col" className="py-3 px-6">Price</th>
                        <th scope="col" className="py-3 px-6">Dimension Covered (m2)</th>
                        <th scope="col" className="py-3 px-6">Price per m2</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6">
                                <div className="py-4 flex justify-start">
                                    <Link href={row.link}>
                                        <Image 
                                        src={`/logo/r3m4x.png`} 
                                        width={24} 
                                        height={24} 
                                        alt='logo'
                                        className="transition-transform duration-100 ease-in-out transform hover:scale-110" />
                                    </Link>
                                </div>
                            </td>
                            <td className="py-4 px-6">{row.title}</td>
                            <td className="py-4 px-6">{row.price} {row.currency.toUpperCase()}</td>
                            <td className="py-4 px-6">{row.dimension_covered_m2}</td>
                            <td className="py-4 px-6">{(row.price / row.dimension_covered_m2!).toFixed(2)} {row.currency.toUpperCase()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
