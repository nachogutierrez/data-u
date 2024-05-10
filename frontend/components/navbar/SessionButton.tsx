"use client";

import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation';
import GoogleSignInButton from '../session/GoogleSignInButton';
import useEnvironment, { Environment } from '@/hooks/useEnvironment';
import { isAdmin } from '@/auth.config';

function DropDownMenuItem({ title, onClick = () => { } }: { title: string, onClick: any }) {
    return (
        <li onClick={onClick}
            className="text-nowrap hover:bg-gray-100 cursor-pointer select-none"
            style={{ padding: '10px' }}>
            {title}
        </li>
    )
}

function DropDownMenu({ onClick = () => { } }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = useSession()

    const navigateTo = (path: string) => () => {
        onClick()
        router.push(path)
    }

    function handleSignOutClick() {
        onClick()
        signOut({ callbackUrl: '/', redirect: true })
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            { !pathname.startsWith('/app') && (
                <DropDownMenuItem title={'Go to App'} onClick={navigateTo('/app')} />
            ) }
            { pathname.startsWith('/app') && session?.user?.email && isAdmin(session?.user?.email) && (
                <DropDownMenuItem title={'Admin'} onClick={navigateTo('/app/admin')} />
            ) }
            <DropDownMenuItem title={'Profile'} onClick={navigateTo('/app/profile')} />
            <DropDownMenuItem title={'Sign out'} onClick={handleSignOutClick} />
        </ul>
    )
}

export default function SessionButton() {
    const environment = useEnvironment()
    const { data: session, status } = useSession()
    const isLoading = status === 'loading'

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    // Handle clicking outside of the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref?.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleOnProfilePictureClick() {
        setIsOpen(!isOpen)
    }

    if (isLoading) {
        return <div>Loading</div>
    }

    if (!session) {
        return <GoogleSignInButton />
    }

    return (
        <div ref={ref}
            className="relative flex flex-col items-center">
            <div onClick={handleOnProfilePictureClick}
                className="rounded-full overflow-hidden border-black border-2 cursor-pointer select-none">
                {session?.user?.image && (
                    <Image src={session.user.image} 
                        width={environment === Environment.DESKTOP ? 32 : 48} 
                        height={environment === Environment.DESKTOP ? 32 : 48} 
                        alt='profile pic' />
                )}
            </div>
            <div className={`absolute bg-white z-50 right-0 transition-all ease-in-out duration-200 overflow-hidden origin-top-right ${isOpen ? '' : "opacity-0 scale-0"}`}
                style={{ top: '100%', marginTop: '2px' }}>
                <DropDownMenu onClick={() => setIsOpen(false)}></DropDownMenu>
            </div>
        </div>
    );
}
