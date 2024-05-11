import React from 'react'

export default function Page({ children }: { children: any }) {
    return (
        <main className='m-0 p-0 w-full max-w-full flex-1 overflow-y-auto'>
            {children}
        </main>
    )
}
