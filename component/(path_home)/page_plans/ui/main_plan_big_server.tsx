

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { CheckIcon } from '@/icon/check'


export function Component_MainPlanBigServer() {
    return (
        <Card className="max-w-96 w-96 mt-0 md:mt-6">
            <CardHeader className="flex flex-col items-start pt-6 px-6">
                <h1 className="flex flex-col text-2xl font-bold">
                    Grande Empresa
                </h1>
                <p className='mt-2'>
                    Feito para empresas de grande porte!
                </p>
            </CardHeader>
            <CardBody className="flex flex-col items-center pt-3 pb-6 px-6 overflow-hidden">
                <h2>
                    <span className='text-4xl font-bold'>R$79</span> /mês
                </h2>
                <Button as={Link} href="#" variant="shadow" color="success" className="text-white text-lg font-bold mt-4">
                    Começar Agora!
                </Button>
            </CardBody>
            <CardFooter className="flex flex-col items-start pt-4 pb-7 px-6">
                <Divider className="w-[95%] h-0.5"/>
                <div className='flex flex-col mt-7 mx-3'>
                    <span className='flex gap-1'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            100.000 Mensagens por Mês
                        </span>
                    </span>
                    <span className='flex gap-1 mt-4'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            15 ChatBot
                        </span>
                    </span>
                    <span className='flex gap-1 mt-4'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            Métricas Personalizadas
                        </span>
                    </span>
                    <span className='flex gap-1 mt-4'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            Ver Mensagens Ao Vivo
                        </span>
                    </span>
                    <span className='flex gap-1 mt-4'>
                        <CheckIcon className='text-green-500 size-6'/>
                        <span>
                            Várias Opções de ChatBot
                        </span>
                    </span>
                </div>
            </CardFooter>
        </Card>
    )
}
