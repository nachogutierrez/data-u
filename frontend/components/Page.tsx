import React from 'react'

export default function Page({ children }: { children: any }) {
    return (
        <main className='m-0 p-0 w-full max-w-full'>
            {children}
        </main>
    )
}
