'use client'

import googleLogo from '@/public/logo/google.png'
import { signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function GoogleSignInButton() {
    function handleClick() {
        signIn('google', { callbackUrl: '/app', redirect: true })
    }

    return (
        <button className='w-full flex items-center font-semibold 
            justify-center transition-colors 
            duration-300 bg-white border-2 border-black text-black 
            rounded-md focus:shadow-black hover:bg-slate-200'
            onClick={handleClick}>
            <Image src={googleLogo} width={20} height={20} alt='Google Logo'></Image>
            <span className=''>Sign In</span>
        </button>
    )
}