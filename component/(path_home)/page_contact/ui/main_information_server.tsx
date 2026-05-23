

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { CorporateIcon } from "@/icon/corporate"
import { CnpjIcon } from "@/icon/cnpj"


export function Component_MainInformationServer() {
    return (
        <>
            <Card className="flex items-center w-[400px] px-3 pt-2 pb-5">
                <CardHeader>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold">Informações</h1>
                    </div>
                </CardHeader>

                <Divider className="w-[90%]"/>

                <CardBody className="flex flex-col gap-2 py-5">
                    {/* <div className="flex gap-1 py-1 px-2">
                        <CorporateIcon className="size-5 mr-3"/>
                        <span>
                            Razão Social: &nbsp;
                        </span>
                        <span className='font-semibold'>
                            Somente Alunos
                        </span>
                    </div>
                    <div className="flex gap-1 py-1 px-2">
                        <CnpjIcon className="size-5 mr-3"/>
                        <span>
                            CNPJ: &nbsp;
                        </span>
                        <span className='font-semibold'>
                            00000
                        </span>
                    </div> */}
                </CardBody>
                
                <Divider className="w-[90%]"/>

                <CardFooter>
                    <div>
                        <span>
                            Estamos à disposição para ajudá-lo com qualquer dúvida ou solicitação, teremos prazer em ajudá-lo.
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}
