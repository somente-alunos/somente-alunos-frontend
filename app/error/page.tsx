"use client"

import { Button, Image } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { Function_clearStudentAuthCookieOnServer } from "@/app/auth_cookie_client"

export default function ErrorPage() {
    const router = useRouter()

    const Function_exitAndRetry = async (): Promise<void> => {
        await Function_clearStudentAuthCookieOnServer()
        router.push('/entrar')
    }

    return (
        <>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .floating {
                    animation: float 6s ease-in-out infinite;
                }
                @media (min-width: 768px) {
                    body {
                        background: radial-gradient(circle at 40% center, hsl(190deg 100% 50% / 45%) 5%, hsl(180deg 100% 50% / 10%) 75%, white 50%) !important;
                    }
                }
                body {
                    background: radial-gradient(circle at 80% center, hsl(190deg 100% 50% / 45%) 5%, hsl(180deg 100% 50% / 10%) 100%);
                }
            `}</style>

            <div className="min-h-[100svh] w-full flex flex-col items-center justify-center px-4">
                <div className="max-w-[600px] w-full text-center">
                    {/* Logo */}
                    <div className="mb-0 flex justify-center">
                        <Image
                            src="/icon-preto-200x200.png"
                            alt="Logo"
                            width={80}
                            className="floating opacity-75"
                        />
                    </div>

                    {/* Main Message */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Em Manutenção
                    </h1>

                    {/* Description */}
                    <div className="space-y-4 text-gray-600">
                        <p className="text-lg md:text-xl">
                            Estamos realizando algumas melhorias no sistema
                        </p>
                        <p className="text-base md:text-lg">
                            Nossa equipe está trabalhando para trazer uma experiência ainda melhor para você.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => { Function_exitAndRetry() }}
                            variant="shadow"
                            color="primary"
                            size="lg"
                            className="font-semibold px-8"
                        >
                            Sair e tentar novamente
                        </Button>
                        <Button 
                            onClick={() => router.push('/suporte')}
                            variant="bordered"
                            color="secondary"
                            size="lg"
                            className="font-semibold px-8 active:bg-secondary-500 active:text-white"
                        >
                            Contatar Suporte
                        </Button>
                    </div>

                    {/* Return Time */}
                    <p className="text-sm md:text-base text-gray-500 mt-12">
                        Estaremos de volta em breve com novidades!
                    </p>

                    {/* Footer */}
                    <div className="mt-16 text-sm text-gray-400">
                        © 2026 Somente Alunos - Todos os direitos reservados
                    </div>
                </div>
            </div>
        </>
    )
}
