

'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tabs, Tab } from '@nextui-org/react'
import { MetricIcon } from '@/icon/metric'
import { LiveIcon } from '@/icon/live'
import { EditIcon } from '@/icon/edit'
import { LibraryIcon } from '@/icon/library'
import { AcquiredIcon } from '@/icon/acquired'
import { CartIcon } from '@/icon/cart'


export function Component_HeaderIdChatbotTabsServer() {
    const Const_pathname = usePathname() || ''
    const Const_penultimateBar = Const_pathname?.lastIndexOf('/', Const_pathname.length - 2)
    const Const_lastPath = Const_pathname.slice(Const_penultimateBar)

    const Const_menuItem = [
        {
            name: 'Biblioteca',
            key: 'biblioteca',
            icon: <LibraryIcon className='size-5'/>,
            href: './biblioteca'
        },
        {
            name: 'Adquiridos',
            key: 'adquiridos',
            icon: <AcquiredIcon className='size-5'/>,
            href: './adquiridos'
        },
        {
            name: '',
            key: 'carrinho',
            icon: <CartIcon className='size-5'/>,
            href: './carrinho'
        }
    ]

    return (
        <>
            <Tabs classNames={{tabList: 'shadow-medium border-[#000000] border-1 bg-white'}} fullWidth className='w-full' selectedKey={`tab_${Const_lastPath}`} aria-label="Options" radius="full" color="primary" variant="solid">
                {
                    Const_menuItem.map((Let_single) => {
                        const Const_href = Let_single.href
                        const Const_penultimateBarHref = Const_href.lastIndexOf('/', Const_href.length - 2)
                        const Const_lastPathHref = Const_href.slice(Const_penultimateBarHref)

                        const Const_icon = Let_single.icon
                        const Const_name = Let_single.name
                        const Const_key = Let_single.key
                        return (
                            <Tab className='h-[38px]' key={`tab_${Const_lastPathHref}`} as={Link} href={Const_href}
                                title={
                                    <div className="flex items-center">
                                        {Const_icon}
                                        <span className={`font-semibold tracking-wider text-[13px] ml-1.5 ${Const_key === 'carrinho' ? 'after:content-[""] md:after:content-["Carrinho"]' : ''}`}>
                                            {Const_name}
                                        </span>
                                    </div>
                                }
                            />
                        )
                    })
                }
            </Tabs>
        </>
    )
}
