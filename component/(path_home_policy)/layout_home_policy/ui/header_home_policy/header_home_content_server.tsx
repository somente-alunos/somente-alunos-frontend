

'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Tabs, Tab, Button } from '@nextui-org/react'

import { RobotIcon } from '@/icon/robot'
import { SupportIcon } from '@/icon/support'
import { PoliticIcon } from '@/icon/politic'
import { AboutIcon } from '@/icon/about'
import { Icon_Brand } from '@/icon/brand'


export function Component_HeaderHomeContentServer() {
    const Const_pathname = usePathname()

    const Const_menuItem = [
        {
            name: 'Inicio',
            key: 'home',
            icon: <RobotIcon size={22}/>,
            href: '/home'
        },
        /* {
            name: 'Preços',
            key: 'plans',
            icon: <CrownIcon size={22}/>,
            href: '/plans'
        }, */
        {
            name: 'Suporte',
            key: 'support',
            icon: <SupportIcon size={20}/>,
            href: '/home/suporte'
        },
        {
            name: 'Política',
            key: 'policy',
            icon: <PoliticIcon size={20}/>,
            href: '/home/politica'
        },
        {
            name: 'Sobre',
            key: 'about',
            icon: <AboutIcon size={18}/>,
            href: '/home/sobre'
        }
    ]
    return (
        <>
            {/* \/ Layout Home \/ */}
                <Navbar maxWidth='xl' className='shadow-white bg-background shadow-sm py-2'>
                    {/* \/ Botão Menu -> Mobile e Tablet \/ */}
                        <NavbarMenuToggle className='md:hidden'/>
                    {/* /\ Botão Menu -> Mobile e Tablet /\ */}

                    {/* \/ Bloco Link -> Mobile e Tablet \/ */}
                        <NavbarMenu>
                            {
                                Const_menuItem.map((Let_single) => {
                                    const Const_href = Let_single.href
                                    const Const_icon = Let_single.icon
                                    const Const_name = Let_single.name
                                    const Const_currentPage = Const_href === Const_pathname ? true : false
                                    const Const_styleBold = Const_currentPage ? 'font-bold' : ''
                                    return (
                                        /* \/ Link Individual -> Desktop \/ */
                                            <NavbarMenuItem className='mt-[15px]' key={`navbar_mobile_tablet_${Const_href}`}>
                                                <Link href={Const_href} className={`w-full text-lg flex items-center gap-2 mt-2 ${Const_styleBold}`}>
                                                    {Const_icon}
                                                    {Const_name}
                                                </Link>
                                            </NavbarMenuItem>
                                        /* /\ Link Individual -> Desktop /\ */
                                    )
                                })
                            }
                        </NavbarMenu>
                    {/* /\ Link Pages -> Mobile e Tablet /\ */}

                    {/* \/ Bloco Inicial -> Todos \/ */}
                        <NavbarContent justify='start' className='gap-16'>
                            {/* \/ Logo -> Todos \/ */}
                                <NavbarItem as={Link} href='/'>
                                    <NavbarBrand className='md:-mt-1  flex flex-col'>
                                        <Icon_Brand className='h-11 md:h-16 ml-[-3px] mb-[0px]' size={60}/>
                                        <span className='-mt-2 text-sm md:-mt-4 md:text-base flex font-bold text-inherit'>Somente Alunos</span>
                                    </NavbarBrand>
                                </NavbarItem>
                            {/* /\ Logo -> Todos /\ */}

                            {/* \/ Bloco Link -> Desktop \/ */}
                                <NavbarItem className='hidden md:flex gap-5'>
                                        <Tabs selectedKey={`tab_desktop_${Const_pathname}`} aria-label="Options" color="primary" variant="bordered">
                                            {
                                                Const_menuItem.map((Let_single) => {
                                                    const Const_href = Let_single.href
                                                    const Const_icon = Let_single.icon
                                                    const Const_name = Let_single.name
                                                    return (
                                                        /* \/ Link Individual -> Desktop \/ */
                                                            <Tab
                                                                key={`tab_desktop_${Const_href}`}
                                                                as={Link}
                                                                href={Const_href}
                                                                title={
                                                                    <div className="flex items-center space-x-2">
                                                                        {Const_icon}
                                                                        <span>{Const_name}</span>
                                                                    </div>
                                                                }
                                                            />
                                                        /* /\ Link Individual -> Desktop /\ */
                                                    )
                                                })
                                            }
                                        </Tabs>
                                </NavbarItem>
                            {/* /\ Bloco Link -> Desktop /\ */}
                        </NavbarContent>
                    {/* /\ Bloco Inicial -> Todos /\ */}

                    {/* \/ Bloco Final -> Todos \/ */}
                        <NavbarContent justify='end' className='gap-16'>
                            {/* \/ Bloco Auth -> Todos \/ */}
                            <NavbarItem className='flex gap-5'>
                                <Button as={Link} href='/entrar' color='primary' variant='solid' className='font-bold text-white active:bg-primary-700 active:text-white'>
                                    Entrar Agora!
                                </Button>
                            </NavbarItem>
                            {/* /\ Bloco Auth -> Todos /\ */}

                            {/* {/ \/ Botão Troca Tema -> Desktop \/ /}
                            <NavbarItem className='hidden md:flex'>
                                <Component_HeaderHomeClient/>
                            </NavbarItem>
                            {/ /\ Botão Troca Tema -> Desktop /\ /} */}
                        </NavbarContent>
                    {/* /\ Bloco Final -> Todos /\ */}
                </Navbar>
            {/* /\ Layout Home /\ */}
        </>
    )
}
