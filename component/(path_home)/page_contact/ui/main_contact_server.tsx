

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { WhastappIcon } from "@/icon/whatsapp"
import { CallIcon } from "@/icon/call"
import { EmailIcon } from "@/icon/email"


export function Component_MainContactServer() {
    return (
        <>
            <Card className="flex items-center w-[400px] px-3 pt-2 pb-5">
                <CardHeader>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold">Suporte</h1>
                    </div>
                </CardHeader>

                <Divider className="w-[90%]"/>

                <CardBody className="flex flex-col gap-2 py-5">
                    <Link isBlock isExternal href="https://api.whatsapp.com/send/?phone=5531973429587&text=Ol%C3%A1%2C+pode+me+ajudar%3F&type=phone_number&app_absent=0" color="success">
                        <WhastappIcon className="size-5 mr-3"/>
                        <span className='text-black'>
                            WhatsApp: &nbsp;
                        </span>
                        <span>
                            (31) 9 7342-9587
                        </span>
                    </Link>
                    <Link isBlock isExternal href="tel:31973429587" color="success">
                        <CallIcon className="size-5 mr-3"/>
                        <span className='text-black'>
                            Telefone: &nbsp;
                        </span>
                        <span>
                            (31) 9 7342-9587
                        </span>
                    </Link>
                    <Link isBlock isExternal href="mailto:suporte@somentealunos.vip" color="success">
                        <EmailIcon className="size-5 mr-3"/>
                        <span className='text-black'>
                            Email: &nbsp;
                        </span>
                        <span>
                            suporte@somentealunos.vip
                        </span>
                    </Link>
                </CardBody>
                
                <Divider className="w-[90%]"/>

                <CardFooter>
                    <div>
                        <span className='text-black'>
                            Horário: &nbsp;
                        </span>
                        <span className="font-semibold">
                            Segunda a Sábado, das 8h às 21h
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}
