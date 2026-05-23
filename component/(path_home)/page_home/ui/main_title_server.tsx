

'use client'


import { Button } from '@nextui-org/react'
import { CheckIcon } from '@/icon/check'
import Link from 'next/link'


export function Component_MainTitleServer() {
    return (
        <>
            <style>
                {`
                    body {
                        --nextui-secondary: 285 100% 50%;
                    }
                `}
            </style>
            <div className='flex flex-col'>
                <h1 className='text-5xl font-semibold text-white'>
                    Compartilhamento de Conhecimento
                </h1>
                <p className='text-2xl mt-4 text-white'>
                    Fortaleça sua rede de estudos com a troca de informações valiosas
                </p>
                <div className='flex gap-4 mt-6'>
                    <Button as={Link} href='/entrar' id='IdElement_compomentRegisterHighlight' color='primary' size='lg' variant='solid' className='font-bold mt-1 active:bg-primary-700 active:text-white'>
                        Entrar Agora!
                    </Button>
                </div>
                <div className='flex flex-col gap-2 mt-9'>
                    <div className='flex gap-2'>
                        <div className='flex gap-1 w-1/2'>
                            <CheckIcon className='text-green-100 size-6'/>
                            <span className='text-white'>
                                Compartilhado por alunos
                            </span>
                        </div>
                        <div className='flex gap-1 w-1/2'>
                            <CheckIcon className='text-green-100 size-6'/>
                            <span className='text-white'>
                                Desenvolvido e mantido por estudantes
                            </span>
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <div className='flex gap-1 w-1/2'>
                            <CheckIcon className='text-green-100 size-6'/>
                            <span className='text-white'>
                                Anonimato total
                            </span>
                        </div>
                        <div className='flex gap-1 w-1/2'>
                            <CheckIcon className='text-green-100 size-6'/>
                            <span className='text-white'>
                                Facilite seus estudos
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
