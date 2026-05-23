

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { CheckIcon } from '@/icon/check'


export function Component_MainPlanFreeServer() {
    return (
        <Card className="md:max-w-full md:w-[70%] mx-auto grid grid-cols-2 max-w-96 w-96">
            <CardHeader className="col-span-1 flex flex-col items-start pb-4 pt-5 pl-6">
                <h1 className="flex flex-col text-2xl font-bold">
                    Gratuito
                </h1>
                <p className='mt-2'>
                    Feito para dar inicio ao seu projeto!
                </p>
            </CardHeader>
            <CardBody className="col-span-1 flex flex-col md:flex-row gap-2 md:gap-7 items-center pb-4 pt-5 pr-7 justify-end overflow-hidden">
                <h2 className='whitespace-nowrap'>
                    <span className='text-4xl font-bold'>R$0</span> /mês
                </h2>
                <Button as={Link} href="#" variant="shadow" color="success" className="text-white text-lg font-bold">
                    Começar Agora!
                </Button>
            </CardBody>
            <CardFooter className="col-span-2 flex flex-col items-start md:pt-1 pt-4 pb-5 px-6">
                <Divider className="w-[95%] h-0.5 mx-auto"/>
                <div className='flex flex-col md:flex-row mt-4 mx-3 flex-wrap gap-x-6 gap-y-2'>
                    <span className='flex gap-1'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            500 Mensagens por Mês
                        </span>
                    </span>
                    <span className='flex gap-1'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            1 ChatBot
                        </span>
                    </span>
                    <div className='flex flex-col md:flex-row flex-wrap gap-x-6 gap-y-2'>
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
