

import { Component_HeaderHomeContentServer } from '@/component/(path_home_policy)/layout_home_policy/ui/header_home_policy/header_home_content_server'
import { Component_FooterHomeContentServer } from '@/component/(path_home_policy)/layout_home_policy/ui/footer_home_policy/footer_home_content_server'
import { Suspense } from 'react'


export default function Layout_Home(Parameter_content: Readonly<{children: React.ReactNode}>): JSX.Element {
    const Const_children = Parameter_content.children
    return (
        <>
            <style>
                {`
                    body {
                        --nextui-box-shadow-medium: 0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3) !important; 
                    }
                `}
            </style>

            <header>
                <Component_HeaderHomeContentServer/>
            </header>

            <main>
                <Suspense fallback={<div>Carregando...</div>}>
                    {Const_children}
                </Suspense>
            </main>

            <footer>
                <Component_FooterHomeContentServer/>
            </footer>
        </>
    )
}
