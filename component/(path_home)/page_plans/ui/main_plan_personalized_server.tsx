

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { CheckIcon } from '@/icon/check'


export function Component_MainPlanPersonalizedServer() {
    return (
        <Card className="md:max-w-full md:w-[90%] mx-auto flex flex-col md:grid md:grid-cols-2 max-w-96 w-96">
            <CardHeader className="md:col-span-1 flex flex-col items-start pb-4 pt-6 pl-7">
                <h1 className="flex flex-col text-2xl font-bold">
                    Personalizado
                </h1>
                <p className='mt-2'>
                    Feito sob encomenda para empresas de qualquer porte!
                </p>
            </CardHeader>
            <CardBody className="md:col-span-1 flex flex-col md:flex-row md:gap-7 items-center pb-6 pt-5 md:pl-0 md:pr-8 justify-end overflow-hidden">
                <h2 className='whitespace-nowrap'>
                    <span className='text-4xl font-bold'>R$199 - R$299</span> /mês
                </h2>
                <Button as={Link} href="#" variant="shadow" color="success" className="text-white text-lg font-bold mt-4 md:mt-0">
                    Começar Agora!
                </Button>
            </CardBody>
            <CardFooter className="md:col-span-2 flex flex-col items-start pt-3 pb-9 px-6">
                <Divider className="w-[95%] h-0.5 mx-auto"/>
                <div className='flex flex-col mt-7 mx-3 flex-wrap gap-x-6 gap-y-4'>
                    <span className='flex gap-1'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            Até 1.000.000 Mensagens por Mês
                        </span>
                    </span>
                    <span className='flex gap-1'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            Até 100 ChatBot
                        </span>
                    </span>
                    <div className='flex flex-col flex-wrap gap-x-6 gap-y-4'>
                        <span className='flex gap-1'>
                            <CheckIcon className='text-green-500 size-6'/>
                            <span>
                                Métricas Personalizadas
                            </span>
                        </span>
                        <span className='flex gap-1'>
                            <CheckIcon className='text-green-500 size-6'/>
                            <span>
                                Ver Mensagens Ao Vivo
                            </span>
                        </span>
                        <span className='flex gap-1'>
                            <CheckIcon className='text-green-500 size-6'/>
                            <span>
                                Várias Opções de ChatBot
                            </span>
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
