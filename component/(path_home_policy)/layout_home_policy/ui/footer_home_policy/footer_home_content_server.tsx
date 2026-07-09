

'use client'


import Link from 'next/link'
import { Divider, Link as LinkNextUi } from "@nextui-org/react"


export function Component_FooterHomeContentServer() {
    return (
        <>
            <div className="flex items-center flex-col mx-[5%] mb-12">
                <Divider className="w-[90%] h-0.5 mt-10"/>
                <div className='flex flex-col md:flex-row content-around mt-10'>
                    <div className='flex flex-col'>
                        <div className='flex flex-col md:flex-row w-[100%] md:w-[100%] flex-wrap gap-x-8 gap-y-1'>
                            <LinkNextUi as={Link} href="/termos" color="primary">
                                Termos de serviço
                            </LinkNextUi>
                            <LinkNextUi as={Link} href="/privacidade" color="primary">
                                Política de privacidade
                            </LinkNextUi>
                            <LinkNextUi as={Link} href="/seguranca" color="primary">
                                Segurança e privacidade
                            </LinkNextUi>
                            <LinkNextUi as={Link} href="/processo" color="primary">
                                Acordo de processamento de dados
                            </LinkNextUi>
                        </div>
                        <div className='w-[100%] md:w-[100%] mt-6'>
                            <p className='text-slate-800'>
                                Copyright© 2026. Somente Alunos. Todos os direitos reservados
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}