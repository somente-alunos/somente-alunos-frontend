

'use client'


import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, Dropdown, DropdownTrigger, DropdownItem, DropdownMenu, Avatar, Button, Image } from '@nextui-org/react'

import { Icon_Brand } from '@/icon/brand'
import { ExitIcon } from '@/icon/exit'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { Function_clearAuthCookieOnServer } from '@/app/auth_cookie_client'

export type Type_informationChatbot = {
    nameChatbot: string;
    imageChatbot: string;
}

export function Component_HeaderIdChatbotContentServer({value: { isInfUser } }: Readonly<{value: {isInfUser: {user_uuid: string}}}>): JSX.Element {
    const router = useRouter()
    const [isHeaderActionLoadingTarget, setHeaderActionLoadingTarget] = useState("")
    const Const_studentSessionStorageKey = 'somente_alunos_student_session_v1'
    useEffect(() => {
        let prevScrollpos = window.scrollY
        window.onscroll = function() {
            let currentScrollPos = window.scrollY
            let headerElement = null
            if (typeof document !== 'undefined') {
                headerElement = document?.getElementById("IdElement_headerIdChatbotContent")
            }
            if (headerElement) {
                if (prevScrollpos < currentScrollPos && prevScrollpos >= 138) {
                    headerElement.style.top = "-75px"
                } else {
                    headerElement.style.top = "0"
                }
            }
            prevScrollpos = currentScrollPos
        }
    }, [])

    function Function_navigateSupportWithFeedback() {
        if (isHeaderActionLoadingTarget) {
            return
        }

        setHeaderActionLoadingTarget("support")
        router.push('/suporte')
    }

    async function handleLogout() {
        if (isHeaderActionLoadingTarget) {
            return
        }

        setHeaderActionLoadingTarget("logout")

        // excluir cookie aut (HttpOnly: so o backend consegue expirar)
        await Function_clearAuthCookieOnServer()

        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(Const_studentSessionStorageKey)
        }
        router.push('/entrar')
    }

    return (
        <>
            {<Navbar id='IdElement_headerIdChatbotContent' maxWidth='xl' style={{transition: 'top 0.8s cubic-bezier(0.65, 0.05, 0.36, 1) 0s', borderBottom: '1px solid hsl(0deg 0% 0% / 100%)'}} className='top-0 bg-[hsl(0,0%,100%,0%)] fixed pt-2 py-1 md:py-0 shadow-medium' classNames={{wrapper: "px-4 gap-0 md:gap-4"}}>
                <NavbarContent justify='start' className='gap-16 !flex-grow-0'>
                    <NavbarItem as={Link} href='#'>
                        <NavbarBrand className='flex gap-3'>
                            <Image className='w-[52px] max-w-[52px]' src='/icon-preto-200x200.png'></Image>
                            <span className='text-lg hidden font-bold md:flex text-black'>
                                Somente Alunos
                            </span>
                        </NavbarBrand>
                    </NavbarItem>
                </NavbarContent>

                <NavbarContent justify='end' className='gap-4 md:gap-6'>
                    {/* <div className='flex flex-col items-end mr-0 md:mr-2'>
                        {isInfUser.user_uuid?.split('-')[0] && (
                            <>
                                <span className='-mb-1 whitespace-nowrap text-sm'>
                                    Você está anônimo
                                </span>
                                <span className='font-semibold mr-1 text-sm'>
                                    @{isInfUser.user_uuid?.split('-')[0]}
                                </span>
                            </>
                        )
                        }
                    </div> */}
                    <Button onClick={Function_navigateSupportWithFeedback} variant='bordered' color='primary' className='font-semibold active:bg-primary-500 active:text-white' isLoading={isHeaderActionLoadingTarget === "support"} isDisabled={!!isHeaderActionLoadingTarget}>
                        Suporte
                    </Button>
                    <Button onClick={handleLogout} variant='bordered' color='danger' className='font-semibold min-w-[44px] p-0 active:bg-danger-500 active:text-white' isLoading={isHeaderActionLoadingTarget === "logout"} isDisabled={!!isHeaderActionLoadingTarget}>
                        <ExitIcon className='w-[26px]'/>
                    </Button>
                </NavbarContent>
            </Navbar>}
        </>
    )
}
