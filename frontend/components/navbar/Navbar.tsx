import React from 'react'

export function linkClassNames(pathname: string, targetPathname: string) {
    return `select-none ${targetPathname === pathname ? 'underline pointer-events-none' : ''}`
} 

export default function Navbar({ children }: { children: any }) {
    return (
        <nav className="w-full max-w-full m-0 pr-5 pl-5 pb-2 pt-2 sticky top-0 z-50 bg-white shadow-md">
            {children}
        </nav>
    )
}
