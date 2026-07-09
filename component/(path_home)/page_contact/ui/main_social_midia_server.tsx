

'use client'


import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Button } from "@nextui-org/react"
import { InstagramIcon } from "@/icon/instagram"
import { FacebookIcon } from "@/icon/facebook"
import { LinkedinIcon } from "@/icon/linkedin"
import { TiktokIcon } from "@/icon/tiktok"
import { YoutubeIcon } from "@/icon/youtube"
import { TwitterIcon } from "@/icon/twitter"


export function Component_MainSocialMidiaServer() {
    return (
        <>
            <Card className="flex items-center w-[400px] px-3 pt-2 pb-5">
                <CardHeader>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold">Rede Social</h1>
                    </div>
                </CardHeader>

                <Divider className="w-[90%]"/>

                <CardBody className="flex justify-around flex-col gap-2 py-5">
                    <div className="flex flex-col gap-2">
                        <Link isBlock isExternal href="https://instagram.com/somentealunos_com" color="success">
                            <InstagramIcon className="size-5 mr-3"/>
                            <span className='text-black'>
                                Instagram: &nbsp;
                            </span>
                            <span>
                                @somentealunos_com
                            </span>
                        </Link>
                        <Link isBlock isExternal href="https://tiktok.com/@somentealunos_com" color="success">
                            <TiktokIcon className="size-5 mr-3"/>
                            <span className='text-black'>
                                TikTok: &nbsp;
                            </span>
                            <span>
                                @somentealunos_com
                            </span>
                        </Link>
                        <Link isBlock isExternal href="https://x.com/somentealunos" color="success">
                            <TwitterIcon className="size-5 mr-3"/>
                            <span className='text-black'>
                                Twitter: &nbsp;
                            </span>
                            <span>
                                somentealunos
                            </span>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
