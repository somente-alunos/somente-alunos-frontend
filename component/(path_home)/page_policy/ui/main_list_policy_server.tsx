

'use client'


import Link from 'next/link'
import { Card, CardHeader, CardBody, CardFooter, Divider, Link as LinkNextUi } from "@nextui-org/react"
import { ArrowRightIcon } from '@/icon/arrow_right'


export function Compoment_MainListPolicyServer() {
    return (
        <>
            <Card className="flex w-[600px] px-3 pt-2 pb-3">
                <CardHeader>
                    <h1 className="text-2xl font-semibold">
                        Informações importantes
                    </h1>
                </CardHeader>

                <Divider className="w-[90%] ml-2"/>

                <CardBody className="flex flex-col gap-3 py-5">
                    <LinkNextUi as={Link} isBlock href="/termos" color="success">
                        <ArrowRightIcon className="size-5 mr-2"/>
                        <span>
                            Termos de serviço
                        </span>
                    </LinkNextUi>

                    <LinkNextUi as={Link} isBlock href="/privacidade" color="success">
                        <ArrowRightIcon className="size-5 mr-2"/>
                        <span>
                            Política de privacidade
                        </span>
                    </LinkNextUi>

                    <LinkNextUi as={Link} isBlock href="/seguranca" color="success">
                        <ArrowRightIcon className="size-5 mr-2"/>
                        <span>
                            Segurança e privacidade
                        </span>
                    </LinkNextUi>

                    <LinkNextUi as={Link} isBlock href="/processo" color="success">
                        <ArrowRightIcon className="size-5 mr-2"/>
                        <span>                 
                            Acordo de processamento de dados
                        </span>
                    </LinkNextUi>
                </CardBody>

                <Divider className="w-[90%] ml-2"/>

                <CardFooter className="mt-1">
                    <span>
                        Para mais informações entre em contato conosco.&nbsp;
                    </span>
                    <LinkNextUi as={Link} isBlock showAnchorIcon href="/suporte" color="success">
                        Suporte
                    </LinkNextUi>
                </CardFooter>
            </Card>
        </>
    )
}
