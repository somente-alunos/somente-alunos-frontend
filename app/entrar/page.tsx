
"use client"


import Link from "next/link"
import { IconEyeFilled } from "@/icon/IconEyeFilled"
import { IconEyeSlashFilled } from "@/icon/IconEyeSlashFilled"
import { IconInvitation } from "@/icon/IconInvitation"
import { IconKey } from "@/icon/IconKey"
import { IconUser } from "@/icon/IconUser"
import {
    Input,
    Button,
    Spacer,
    AvatarGroup,
    Avatar,
    Image,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/react"
import { useRouter } from "next/navigation"
import React, { FormEvent, useEffect, useState } from "react"
import { Headset, Github, ChevronRight, Info } from "lucide-react"
import { Type_backendStudentLoginResponse } from "@/env"
import { Function_markDeviceReportPendingAfterLogin } from "@/app/device_report_client"
import { Function_clearStudentAuthCookieOnServer } from "@/app/auth_cookie_client"

const Const_studentSessionStorageKey = 'somente_alunos_student_session_v1'
const Const_inviteCodeSuggestionStorageKey = 'somente_alunos_invite_code_suggestion_v1'
const Const_openSourceRepositoryUrl = "https://github.com/somente-alunos?tab=repositories"


export default function LoginPage() {
    // Troque para true para reativar login por senha rapidamente.
    const ALLOW_PASSWORD_LOGIN = false

    const [isVisible, setIsVisible] = React.useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const [isInvalid, setInvalid] = useState(false)
    const [isLoad, setLoad] = useState(true)
    const [isReady, setReady] = useState(false)
    const [usePassword, setUsePassword] = useState(false)
    const [inviteCode, setInviteCode] = useState("")
    const [username, setUsername] = useState("")
    const [isIdentityInfoModalOpen, setIdentityInfoModalOpen] = useState(false)
    const router = useRouter()

    const Function_clearAccessArtifacts = async (): Promise<void> => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(Const_studentSessionStorageKey)
        }

        await Function_clearStudentAuthCookieOnServer()
    }

    const triggerErrorAnimation = () => {
        if (typeof document !== 'undefined') {
            document?.querySelectorAll('[data-slot="input-wrapper"]').forEach((el) => {
                (el as HTMLElement).style.cssText += '; transition-duration: 150ms !important;'
            })
            document?.querySelectorAll('[data-slot="label"]').forEach((el) => {
                (el as HTMLElement).style.cssText += '; transition-duration: 200ms !important;'
            })
            document?.querySelectorAll('[data-slot="input"]').forEach((el) => {
                (el as HTMLElement).style.cssText += '; transition-duration: 200ms !important;'
            })
            document?.querySelectorAll('#icon-input').forEach((el) => {
                (el as HTMLElement).style.cssText = '; color: hsl(0 55% 60% / 1) !important; background-color: hsl(0 100% 90% / 1) !important; transition-duration: 200ms !important;'
            })
        }
        setInvalid(true)
        setReady(false)
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document?.querySelectorAll('[data-slot="input-wrapper"]').forEach((el) => {
                    (el as HTMLElement).style.cssText += '; transition-duration: 1.5s !important;'
                })
                document?.querySelectorAll('[data-slot="label"]').forEach((el) => {
                    (el as HTMLElement).style.cssText += '; transition-duration: 3s !important;'
                })
                document?.querySelectorAll('[data-slot="input"]').forEach((el) => {
                    (el as HTMLElement).style.cssText += '; transition-duration: 3s !important;'
                })
                document?.querySelectorAll('#icon-input').forEach((el) => {
                    (el as HTMLElement).style.cssText = 'transition-duration: 1.5s !important;'
                })
            }
            setInvalid(false)
        }, 4500)
    }

    const Function_getInviteCodeSuggestionFromStorage = (): string => {
        if (typeof localStorage === 'undefined') {
            return ""
        }

        const Const_rawValue = localStorage.getItem(Const_inviteCodeSuggestionStorageKey)
        if (!Const_rawValue) {
            return ""
        }

        // Versoes antigas gravavam o codigo como JSON (string ou array de strings).
        if (Const_rawValue.startsWith('"') || Const_rawValue.startsWith('[')) {
            try {
                const Const_unknownValue = JSON.parse(Const_rawValue) as unknown
                if (typeof Const_unknownValue === "string") {
                    return Const_unknownValue.trim().toUpperCase()
                }
                if (Array.isArray(Const_unknownValue)) {
                    const Const_firstInviteCode = Const_unknownValue.find(
                        (Parameter_single): Parameter_single is string => typeof Parameter_single === "string"
                    )
                    return Const_firstInviteCode ? Const_firstInviteCode.trim().toUpperCase() : ""
                }
                return ""
            }
            catch {
                return ""
            }
        }

        return Const_rawValue.trim().toUpperCase()
    }

    const Function_registerInviteCodeSuggestion = (Parameter_inviteCode: string): void => {
        if (typeof localStorage === 'undefined') {
            return
        }

        const Const_codeNormalized = Parameter_inviteCode.trim().toUpperCase()
        if (!Const_codeNormalized) {
            return
        }

        localStorage.setItem(Const_inviteCodeSuggestionStorageKey, Const_codeNormalized)
    }

    const Function_handleInviteCodeChange = (Parameter_typedValue: string): void => {
        const Const_codeNormalized = Parameter_typedValue.trim().toUpperCase()
        setInviteCode(Const_codeNormalized)

        // Salva assim que o aluno termina de digitar o codigo: nao depende do login dar certo.
        if (Const_codeNormalized.length === 6) {
            Function_registerInviteCodeSuggestion(Const_codeNormalized)
        }
    }

    // O RA/CPF nunca vai para o localStorage: quem guarda e o gerenciador de credenciais do proprio
    // navegador. Como o login por senha esta desativado, o formulario nao tem campo type="password" e
    // o navegador jamais ofereceria salvar sozinho, entao pedimos isso pela Credential Management API.
    // Suportada em Chrome/Edge/Android; nos demais navegadores as funcoes abaixo viram no-op.
    const Function_saveLoginOnBrowserCredentialManager = async (
        Parameter_raOrCpf: string,
        Parameter_inviteCode: string
    ): Promise<void> => {
        try {
            const Const_passwordCredentialConstructor = (window as any).PasswordCredential
            if (!Const_passwordCredentialConstructor || !navigator.credentials?.store) {
                return
            }
            if (!Parameter_raOrCpf || !Parameter_inviteCode) {
                return
            }

            await navigator.credentials.store(new Const_passwordCredentialConstructor({
                id: Parameter_raOrCpf,
                password: Parameter_inviteCode,
                name: Parameter_raOrCpf
            }))
        }
        catch {
            // Navegador sem suporte ou usuario recusou: o login em si nao pode quebrar por causa disso.
        }
    }

    const Function_prefillFromBrowserCredentialManager = async (): Promise<void> => {
        try {
            if (!navigator.credentials?.get) {
                return
            }

            const Const_credential = await navigator.credentials.get({
                password: true,
                mediation: 'silent'
            } as CredentialRequestOptions) as { id?: string, password?: string } | null

            if (!Const_credential?.id) {
                return
            }

            // Nao sobrescreve o que veio da URL nem o que o aluno ja comecou a digitar.
            setUsername((Parameter_current) => Parameter_current || Const_credential.id || "")
            if (Const_credential.password) {
                setInviteCode((Parameter_current) => Parameter_current || (Const_credential.password || "").trim().toUpperCase())
            }
        }
        catch {
            // Sem credencial salva ou navegador sem suporte: o formulario segue vazio, sem erro.
        }
    }

    const executeLogin = async (
        raOrCpf: string,
        password?: string,
        invitationCodeStudent?: string
    ) => {
        try {
            setReady(true)

            const payload: { raOrCpf: string, invitationCodeStudent?: string, password?: string } = {
                raOrCpf: raOrCpf
            }

            if (password) {
                payload.password = password
            } else if (invitationCodeStudent) {
                payload.invitationCodeStudent = invitationCodeStudent
            }
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/student/entrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            })
    
            if (response.ok) {
                const result = await response.json() as Type_backendStudentLoginResponse

                if (invitationCodeStudent) {
                    await Function_saveLoginOnBrowserCredentialManager(raOrCpf, invitationCodeStudent)
                }

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(Const_studentSessionStorageKey, JSON.stringify({
                        student: result.student,
                        collegeArray: result.collegeArray,
                        courseArray: result.courseArray
                    }))
                }

                // JWT do perfil recem-logado ja esta nos cookies: libera o report de dispositivo na biblioteca.
                Function_markDeviceReportPendingAfterLogin()

                router.push('/painel/biblioteca?redirect=1')
                setTimeout(() => {
                    setReady(false)
                }, 30000)
            } else {
                triggerErrorAnimation()
            }
        } catch (error) {
            alert('ERRO - Reinicie a página e tente novamente!')
            setReady(false)
        }
    }

    useEffect(() => {
        // A limpeza dos cookies agora e uma chamada ao backend: precisa terminar antes de um
        // novo login, senao o Set-Cookie de expiracao chega depois e derruba o JWT recem-criado.
        const Function_prepareLoginPage = async (): Promise<void> => {
            const Const_inviteCodeSuggestion = Function_getInviteCodeSuggestionFromStorage()

            const params = new URLSearchParams(window.location.search)
            const hasRedirectFlag = params.has('redirect')
            const cpfParam = params.get('cpf')
            const raParam = params.get('ra')
            const loginParam = (cpfParam || raParam || '').trim()
            const conviteParam = params.get('convite')
            const conviteParamNormalized = (conviteParam || '').trim().toUpperCase()

            // O convite da URL sobrescreve a sugestao salva; sem convite na URL, reaproveita o ultimo
            // codigo usado. Em qualquer caminho abaixo o input ja fica preenchido.
            if (conviteParamNormalized) {
                Function_registerInviteCodeSuggestion(conviteParamNormalized)
                setInviteCode(conviteParamNormalized)
            }
            else if (Const_inviteCodeSuggestion) {
                setInviteCode(Const_inviteCodeSuggestion)
            }

            if (loginParam) {
                setUsername(loginParam)
            }
            else {
                // Sem await: e so um preenchimento de conveniencia, nao pode atrasar a tela de login.
                void Function_prefillFromBrowserCredentialManager()
            }

            if (hasRedirectFlag) {
                await Function_clearAccessArtifacts()
                setLoad(false)
                setReady(false)
                window.history.replaceState({}, '', '/entrar')
                return
            }

            if (loginParam && conviteParamNormalized) {
                await Function_clearAccessArtifacts()
                setUsePassword(false)
                setLoad(false)

                await executeLogin(loginParam, undefined, conviteParamNormalized)
                return
            }

            let hasSessionStorage = false
            if (typeof localStorage !== 'undefined') {
                hasSessionStorage = !!localStorage.getItem(Const_studentSessionStorageKey)
            }
            if (hasSessionStorage) {
                setLoad(false)
                setReady(true)

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/student-or-admin/faculdade/todas`, { credentials: 'include' })
                    if (response.ok) {
                        // Sessao existente revalidada: o JWT nos cookies e do perfil atual.
                        Function_markDeviceReportPendingAfterLogin()

                        router.push('/painel/biblioteca?redirect=1')
                        return
                    }
                }
                catch {
                    // Sem acao: cai na limpeza abaixo e mostra o formulario de login.
                }

                await Function_clearAccessArtifacts()
                setReady(false)
                return
            }

            if (ALLOW_PASSWORD_LOGIN) {
                setUsePassword(!conviteParamNormalized)
            } else {
                setUsePassword(false)
            }

            setLoad(false)
        }

        Function_prepareLoginPage()
    }, [])

    function scrollToBottom() {
        let scrollableDiv = null
        if (typeof document !== 'undefined') {
            scrollableDiv = document?.getElementById('secondHalf')
        }
        scrollableDiv?.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest"})
    }
 
    async function handleSubmitLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const cpfOrRa = formData.get('username') as string
        const password = formData.get('password') as string

        if (usePassword) {
            await executeLogin(cpfOrRa, password)
        } else {
            Function_registerInviteCodeSuggestion(inviteCode)
            await executeLogin(cpfOrRa, undefined, inviteCode)
        }
        return false
    }
    const Function_getOpenSourceIdeaContent = (): JSX.Element => {
        return (
            <div className="rounded-2xl border border-black/10 bg-white/30 p-3 backdrop-blur-[2px]">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full p-2 text-[hsl(221,100%,45%)]">
                        <Github size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-semibold text-black/90">Esse projeto é Open Source!</p>
                        <p className="mt-0.5 text-[12px] leading-5 text-black/65">
                            Isso significa que qualquer aluno pode auditar o código do site, para saber como os dados estão sendo tratados!
                        </p>
                    </div>
                </div>
                {<Link
                    href={Const_openSourceRepositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[hsl(221,100%,42%)] active:text-[hsl(221,100%,32%)]"
                >
                    Ver código do site
                    <ChevronRight size={14} />
                </Link>}
            </div>
        )
    }

    const Function_getIdentityHintContent = (): JSX.Element => {
        return (
            <div className="w-full max-w-[370px] rounded-xl px-3 py-2">
                <button
                    type="button"
                    onClick={() => setIdentityInfoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[hsl(219,85%,38%)] active:text-[hsl(219,85%,28%)]"
                >
                    <Info size={13} />
                    <span>Por que precisa do RA/CPF?</span>
                </button>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @media (min-width: 768px) {
                    body {
                        background: radial-gradient(circle at 40% center, hsl(190deg 100% 50% / 45%) 5%, hsl(180deg 100% 50% / 10%) 75%, white 50%) !important;
                    }
                }
                body {
                    background: radial-gradient(circle at 80% center, hsl(190deg 100% 50% / 45%) 5%, hsl(180deg 100% 50% / 10%) 100%);
                    --nextui-secondary: 289 80% 44%;
                    --nextui-success: 270 100% 50%;
                }
            `}</style>

            <div className="max-w-[1400px] w-full h-[100svh] flex flex-col md:flex-row mx-auto">
                <div className="w-full md:w-1/2 md:min-h-[auto] min-h-[100svh] px-6 flex flex-col justify-between bg-[hsla(0,0%,100%,0)]">
                    {/* <div className="flex items-center pt-[18px] md:pt-[35px]"> 
                        <Image className="opacity-75" src="/icon-preto-200x200.png" width={40}/>
                        <span className="font-semibold mb-1 ml-2 text-lg opacity-95">SomenteAlunos.vip</span>
                    </div> */}

                    <div className="w-full mb-12">
						<div className="flex items-center pt-[18px] md:pt-[35px] gap-3.5"> 
							<Image className="opacity-75 mb-3" src="/icon-preto-200x200.png" width={50}/>
							<h1 className="tracking-tight text-4xl md:text-5xl leading-snug font-bold mb-4 whitespace-nowrap">
								Somente Alunos
							</h1>
						</div>
						{/* <h1 className="tracking-tight text-4xl md:text-5xl leading-snug font-bold mb-4">
							Somente Alunos
						</h1> */}
                        <h2 className="tracking-tighter text-2xl md:text-3xl font-normal mb-6">
                            Feito por <span className="font-bold">Alunos</span> de várias Universidades!
                        </h2>
                        {/* <h3 className="tracking-tighter text-xl md:text-2xl font-semibold mb-3.5" style={{ background: 'linear-gradient(112deg, #00d4ff -63.59%, hsl(317 100% 50% / 1) -10.3%, hsl(222 100% 50% / 1) 70.46%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Acesso à informação e compartilhamento.
                        </h3> */}
                        <div className="w-full max-w-[520px] mt-5 -mb-2">
                            {Function_getOpenSourceIdeaContent()}
                        </div>
                        <div className="flex flex-col gap-[8px] mt-[46px] items-center mb-[80px] md:items-start">
                            <AvatarGroup max={7} isBordered>
                                <Avatar showFallback color="secondary" src="/p0.webp" />
                                <Avatar showFallback color="secondary" src="/p6.webp" />
                                <Avatar showFallback color="secondary" src="/p4.webp" />
                                <Avatar showFallback color="secondary" src="/p5.webp" />
                                <Avatar showFallback color="secondary" src="/p3.webp" />
                                <Avatar showFallback color="secondary" src="/p2.webp" />
                            </AvatarGroup>
                            <span className="font-semibold text-[hsl(289,80%,50%)]">Desenvolvedores do Sistema</span>
                        </div>
                        {!isInputFocused && (
                            <div className="flex justify-center">
                                <Button isLoading={isLoad} onClick={scrollToBottom} variant="shadow" color="success" size="lg" className="animate-bounce max-w-[370px] w-full text-[20px] tracking-[1px] font-bold inline-flex md:hidden text-white" spinner={<svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/> </svg>}>
                                    Sou aluno!
                                </Button>
                            </div>
                        )}
                    </div>

                    {!isInputFocused ? (
                        <div className="pb-8 md:pb-[32px] flex flex-col gap-1">
                            <p className="text-black text-base tracking-tighter">
                                © 2026 SomenteAlunos.vip
                            </p>
                            <Link href="/politica" className="text-black/40 active:text-black/80 text-xs font-medium tracking-wide transition-colors w-fit">
                                Política de Privacidade e Segurança
                            </Link>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>

                <div id="secondHalf" className="w-full md:w-1/2 md:min-h-[auto] min-h-[100vh] bg-white flex justify-center pb-3 md:pb-6 md:pt-2 pl-0 pr-0 min-w-screen z-[20] items-start">
                    <form onSubmit={handleSubmitLogin} autoComplete="on" method="POST" target="_top" className="w-full md:w-auto px-6 mb-0 md:mb-auto mt-[33px] md:mt-auto mx-auto flex flex-col items-center">
                        <div className="w-full tracking-tighter text-4xl font-semibold max-w-[370px] mb-8 leading-[3.3rem] flex flex-row flex-wrap items-end">
                            <span>Use seu convite&nbsp;</span>
                            <span className="mr-3">para ter acesso</span> 
                            <Image className="w-[40px] mb-2.5 md:mb-1.5" src="/cutecat-80x80-e.gif"></Image></div>
                        <Spacer y={1} />
                        <Input
                            isInvalid={isInvalid}
                            id="username"
                            name="username"
                            value={username}
                            onValueChange={setUsername}
                            autoComplete="username"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            required
                            minLength={3}
                            className="max-w-[370px]"
                            classNames={{
                                inputWrapper: "pl-0",
                                input: "!pl-2.5"
                            }}
                            variant="flat"
                            labelPlacement="outside"
                            type="text"
                            label="RA ou CPF"
                            placeholder="RA ou CPF"
                            startContent={
                                <IconUser id="icon-input" className="text-2xl text-default-400 pointer-events-none flex-shrink-0 bg-[hsl(216,11%,91%)] h-full rounded-l-[12px] pr-3 pl-3 w-12" />
                            }
                            onFocus={() => {if (window?.innerWidth < 768) {setIsInputFocused(true)}}}
                            onBlur={() => {if (window?.innerWidth < 768) {setIsInputFocused(false)}}}
                        />
                        {Function_getIdentityHintContent()}
                        <Spacer y={7} />
                        <div className="relative w-full max-w-[370px]">
                            <div className={`transition-all duration-300 ${usePassword ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0'}`}>
                                <Input
                                    isInvalid={isInvalid}
                                    name="password"
                                    autoComplete="current-password"
                                    required={usePassword}
                                    minLength={3}
                                    className="max-w-[370px]"
                                    classNames={{
                                        inputWrapper: "pl-0",
                                        input: "!pl-2.5"
                                    }}
                                    variant="flat"
                                    labelPlacement="outside"
                                    label="Senha"
                                    placeholder="Senha"
                                    startContent={
                                        <IconKey id="icon-input" className="text-2xl text-default-400 pointer-events-none flex-shrink-0 bg-[hsl(216,11%,91%)] h-full rounded-l-[12px] pr-3 pl-3 w-12" />
                                    }
                                    endContent={
                                        <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                        {isVisible ? (
                                            <IconEyeSlashFilled className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <IconEyeFilled className="text-2xl text-default-400 pointer-events-none" />
                                        )}
                                        </button>
                                    }
                                    type={isVisible ? "text" : "password"}
                                    onFocus={() => {if (window?.innerWidth < 768) {setIsInputFocused(true)}}}
                                    onBlur={() => {if (window?.innerWidth < 768) {setIsInputFocused(false)}}}
                                />
                            </div>
                            <div className={`transition-all duration-300 ${!usePassword ? 'opacity-100 visible' : 'opacity-0 invisible absolute top-0'}`}>
                                <Input
                                    isInvalid={isInvalid}
                                    name="invitationCodeStudent"
                                    value={inviteCode}
                                    onChange={(e) => Function_handleInviteCodeChange(e.target.value)}
                                    autoComplete="on"
                                    autoCapitalize="characters"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    required={!usePassword}
                                    minLength={6}
                                    maxLength={6}
                                    className="max-w-[370px]"
                                    classNames={{
                                        inputWrapper: "pl-0",
                                        input: "!pl-2.5"
                                    }}
                                    variant="flat"
                                    labelPlacement="outside"
                                    label="Código de Convite"
                                    placeholder="Código de Convite"
                                    startContent={
                                        <IconInvitation id="icon-input" className="text-2xl text-default-400 pointer-events-none flex-shrink-0 bg-[hsl(216,11%,91%)] h-full rounded-l-[12px] pr-3 pl-3 w-12" />
                                    }
                                    onFocus={() => {if (window?.innerWidth < 768) {setIsInputFocused(true)}}}
                                    onBlur={() => {if (window?.innerWidth < 768) {setIsInputFocused(false)}}}
                                />
                            </div>
                        </div>
                        {ALLOW_PASSWORD_LOGIN && (
                            <Button 
                                variant="bordered" 
                                color="primary" 
                                className="mt-3 font-medium text-sm active:bg-primary-500 active:text-white"
                                onClick={() => setUsePassword(!usePassword)}
                            >
                                {usePassword ? "Entrar usando código de convite" : "Entrar usando senha"}
                            </Button>
                        )}
                        <Button type="submit" id="endPage" variant="shadow" color="primary" size="lg" isLoading={isReady || isLoad} className="font-semibold max-w-[370px] w-full mt-[50px] mb-16 text-[18px] tracking-[0.5px]" spinner={<svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/> </svg>}>
                            {isLoad ? "Preparando..." : isReady ? "Entrando..." : "Acessar Painel"}
                        </Button>
                        <Link
                            href="/suporte"
                            className="group max-w-[370px] w-full mt-2 rounded-2xl border border-black/10 bg-[linear-gradient(145deg,hsla(230,100%,97%,1)_0%,hsla(235,100%,98%,1)_58%,hsla(0,0%,100%,1)_100%)] px-4 py-3 transition-all active:border-[hsl(230,100%,50%)] active:shadow-[0_10px_35px_-20px_hsl(230,100%,50%)]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-[hsl(230,100%,94%)] p-2 text-[hsl(230,100%,50%)] transition-colors group-active:bg-[hsl(230,100%,90%)]">
                                    <Headset size={18} />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[15px] font-semibold text-black group-active:text-[hsl(230,100%,45%)] transition-colors">
                                        Falar com o Suporte
                                    </span>
                                    <span className="mt-1 text-[13px] text-black/60">
                                        Segunda a Sábado, das 8h às 21h
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </form>
                </div>
            </div>
            <Modal
                isOpen={isIdentityInfoModalOpen}
                onOpenChange={setIdentityInfoModalOpen}
                placement="center"
                backdrop="blur"
                size="sm"
            >
                <ModalContent>
                    {(onCloseModal) => (
                        <>
                            <ModalHeader className="pb-1">Por que pedimos RA ou CPF?</ModalHeader>
                            <ModalBody className="pt-0">
                                <p className="text-sm text-black/70">
                                    Utilizamos essa informação exclusivamente para verificar se você é um aluno e está vinculado a uma instituição de ensino.
                                </p>
                                <p className="text-sm text-black/70">
                                    Esses dados não são exibidos publicamente nem acessados por terceiros, sendo usados apenas para validação de acesso.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="primary"
                                    variant="solid"
                                    className="active:bg-primary-700"
                                    onPress={onCloseModal}
                                >
                                    Entendi
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

