import React from 'react';

type TableHeaderProps = {
    columns: string[];
};

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
    <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" style={{ zIndex: 1 }}>
        <tr>
            {columns.map((column, index) => (
                <th key={index} scope="col" className="py-3 px-6">
                    {column}
                </th>
            ))}
        </tr>
    </thead>
);

export default TableHeader;
