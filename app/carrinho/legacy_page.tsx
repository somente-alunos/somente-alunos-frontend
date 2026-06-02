

"use client"


export const runtime = "edge"


import { CartIcon } from '@/icon/cart'
import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure, Snippet, Progress } from '@nextui-org/react'
import { useEffect, useState, useContext, useRef, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon } from '@/icon/check'
import { PageContext } from '@/app/painel/layout_context'
import { Type_allModifiedList } from '@/env'
import { RefreshCw, Clock, Calendar, GraduationCap, TimerIcon, ShieldCheck, AlertCircle, Bookmark, Lock, CheckCircle2, ShoppingCart, Check, Eye, CreditCard, Copy, X, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf'
import Script from 'next/script'
import QRCode from "react-qr-code";

const calculateTimeUntilExam = (dtAvaliacao: string, hrInicial: string) => {
    if (!dtAvaliacao || !hrInicial) return Infinity;
    
    const [day, month, year] = dtAvaliacao.split('/').map(Number);
    const [hour, minute] = hrInicial.split(':').map(Number);
    
    const examDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const differenceInHours = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return differenceInHours;
};

const formatTimeUntilExam = (hours: number) => {
    const hoursRemaining = Math.floor(hours);
    const minutesRemaining = Math.floor((hours % 1) * 60);
    return `${hoursRemaining}h ${minutesRemaining}m`;
};

function detectMob() {
    if (typeof window === 'undefined') return false;
    return (
        window.screen.width <= 600 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
}

export default function Page_Library() {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [iframeSrc, setIframeSrc] = useState("")
	const [isSck, setSck] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    // Loading state for the "Baixar PDF" button while printing/previewing
    const [isPdfLoading, setIsPdfLoading] = useState(false)
    // Loading state for the "Compartilhar" button while fetching/sharing
    const [isSharing, setIsSharing] = useState(false)
    // Loading state for the buy button when user clicks "Desbloquear"
    const [isBuying, setIsBuying] = useState(false)
	const [timeRemaining, setTimeRemaining] = useState(0)
	const [priceModal, setPriceModal] = useState(0)
	const [priceHigherModal, setPriceHigherModal] = useState(0)
	const [contentIdQuestionarioAluno, setContentIdQuestionarioAluno] = useState('')
    const [previewItem, setPreviewItem] = useState<Type_allModifiedList | null>(null)
	const reportTemplateRef = useRef(null as unknown as HTMLIFrameElement)
    const isDoneRef = useRef(false)

	const [isUpdating, setIsUpdating] = useState(false)
	const [isInitialLoading, setIsInitialLoading] = useState(true)
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const router = useRouter()
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingTime, setLoadingTime] = useState(0)
    const [loadingMessage, setLoadingMessage] = useState("Buscando conteúdo...")
	const { setDataLibrary, addItemToCart, removeItemToCart, cart, isInfUser, isDataLibrary, intervalData } = useContext(PageContext)

    // PAYMENT STATES
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentStep, setPaymentStep] = useState<'method_selection' | 'pix_payment'>('method_selection')
    const [pixCode, setPixCode] = useState("")
    const [isLoadingPix, setIsLoadingPix] = useState(false)
    const [checkoutItem, setCheckoutItem] = useState<Type_allModifiedList | null>(null)
    const [showCardMaintenance, setShowCardMaintenance] = useState(false)
    const [pixCopied, setPixCopied] = useState(false)
    const [isPaymentComplete, setIsPaymentComplete] = useState(false)
    const pixCache = useRef<Record<string, string>>({})

    const handleOpenCheckout = (item: Type_allModifiedList | null) => {
        if (!item) return
        setCheckoutItem(item)
        setPaymentStep('method_selection')
        setPixCode("")
        setPixCopied(false)
        setShowCardMaintenance(false)
        setIsPaymentComplete(false)
        setIsPaymentModalOpen(true)
    }

    const handlePaymentModalOpenChange = async (isOpen: boolean) => {
        setIsPaymentModalOpen(isOpen)
        
        // If modal is closing and we were in pix payment step, check one last time
        if (!isOpen && paymentStep === 'pix_payment' && checkoutItem && !isPaymentComplete) {
            const sckNew = Function_createSckNew(
                checkoutItem.cdCpf, 
                checkoutItem.cdDisciplina, 
                checkoutItem.dsTipoOportunidade, 
                checkoutItem.nrModulo, 
                checkoutItem.nrAno
            )

            let checkCount = 0
            const maxChecks = 15 // 15 checks * 2 segundos = 30 segundos
            
            const checkPaymentAfterClose = async () => {
                if (checkCount >= maxChecks) return

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/right-payment?txid=${sckNew}`)
                    if (response.ok) {
                        const data = await response.json() as { isPaid: boolean }
                        if (data?.isPaid) {
                            window.location.reload()
                            return // Para o loop se achou sucesso
                        }
                    }
                } catch (err) {
                    console.error("Erro ao verificar pagamento PIX pós-fechamento", err)
                }

                checkCount++
                setTimeout(checkPaymentAfterClose, 2000)
            }

            // Inicia o processo de checagem em background
            checkPaymentAfterClose()
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout
        
        const checkPayment = async () => {
            if (!checkoutItem || paymentStep !== 'pix_payment') return
            
            const sckNew = Function_createSckNew(
                checkoutItem.cdCpf, 
                checkoutItem.cdDisciplina, 
                checkoutItem.dsTipoOportunidade, 
                checkoutItem.nrModulo, 
                checkoutItem.nrAno
            )

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/right-payment?txid=${sckNew}`)
                if (response.ok) {
                    const data = await response.json() as { isPaid: boolean }
                    if (data?.isPaid) {
                        setIsPaymentComplete(true)
                        clearInterval(interval)
                        
                        setTimeout(() => {
                            window.location.reload()
                        }, 3000)
                    }
                }
            } catch (err) {
                console.error("Erro ao verificar pagamento PIX", err)
            }
        }

        if (paymentStep === 'pix_payment' && isPaymentModalOpen && !isPaymentComplete) {
            checkPayment() // Primeira verificação imadiata
            interval = setInterval(checkPayment, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [paymentStep, isPaymentModalOpen, checkoutItem, isPaymentComplete])

    const handlePixPayment = async () => {
        if (!checkoutItem) return

        const sckNew = Function_createSckNew(
            checkoutItem.cdCpf, 
            checkoutItem.cdDisciplina, 
            checkoutItem.dsTipoOportunidade, 
            checkoutItem.nrModulo, 
            checkoutItem.nrAno
        )

        setPaymentStep('pix_payment')

        // Check cache
        if (pixCache.current[sckNew]) {
            setPixCode(pixCache.current[sckNew])
            return
        }

        setIsLoadingPix(true)

        try {
            const name = `${checkoutItem.nmQuestionario} (${checkoutItem.dsTipoOportunidade})`
            // /generate-pix-payment?txid=Function_createSckNew()&name=`${nmQuestionario} (${dsTipoProva})`
            const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/generate-pix-payment?txid=${sckNew}&name=${encodeURIComponent(name)}`, {
                credentials: 'include'
            })
            
            if (response.ok) {
                const data = await response.json() as { pixCopiaECola: string }
                if (data.pixCopiaECola) {
                    setPixCode(data.pixCopiaECola)
                    pixCache.current[sckNew] = data.pixCopiaECola
                }
            }
        } catch (error) {
            console.error("Error generating Pix", error)
        } finally {
            setIsLoadingPix(false)
        }
    }

    const copyPixCode = () => {
        if (!pixCode) return
        navigator.clipboard.writeText(pixCode)
        setPixCopied(true)
        setTimeout(() => setPixCopied(false), 2000)
    }

    // Brenda = D102526369D
    // Ian = O102533867J
    const Const_idProductHotmart = 'D102526369D'

    // 4. A função de clique que contém toda a lógica
    function Function_handleCheckoutClick(checkoutUrl: string) {
        if (checkoutUrl) {
            window.location.href = checkoutUrl
        }
        return true
    }

    const setHtml = async () => {
        console.log("PDF iniciou");

        try {
        // 1️⃣ Buscar o HTML remoto
        const response = await fetch(iframeSrc, {
            credentials: "include" // se precisar enviar cookies
        });

        if (!response.ok) {
            throw new Error("Falha ao buscar HTML: " + response.statusText);
        }

        const htmlText = await response.text();

        // 2️⃣ Injetar o HTML no DOM (div escondida)
        reportTemplateRef.current.innerHTML = htmlText;

        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
        }
    }

    const handleGeneratePdf = async () => {
        // Mostra spinner e texto
        setIsPdfLoading(true)

        try {
            if (!iframeSrc) {
                throw new Error('Fonte do PDF não definida')
            }

            const Const_iframeSrcModified = iframeSrc.replace('/api', process.env.NEXT_PUBLIC_Env_urlApiBackend || 'UrlErro')

            // monta a URL que retorna o PDF (respeita se já existir query)
            const url = Const_iframeSrcModified + (Const_iframeSrcModified.includes('?') ? '&pdf=true' : '?pdf=true')

            const res = await fetch(url, {
                credentials: 'include'
            })

            if (!res.ok) throw new Error('Falha no download: ' + res.status)

            const buffer = await res.arrayBuffer()

            // tenta extrair filename do header Content-Disposition
            let filename = 'download.pdf'
            try {
                const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition')
                if (cd) {
                    const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/) // suporta filename* and filename
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1])
                        console.log('Decoded filename:', filename)
                    }
                }
            } catch (e) {
                // ignore
            }

            const blob = new Blob([buffer], { type: 'application/pdf' })
            const link = document?.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            link.href = objectUrl
            link.download = filename
            document?.body.appendChild(link)
            link.click()
            link.remove()
            // small delay to ensure browser begins the download before revoking
            setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)

        } catch (err) {
            console.error('Erro ao baixar PDF:', err)
            // você pode mostrar um toast/alerta aqui se quiser
        } finally {
            setIsPdfLoading(false)
        }
    }

    const handleGeneratePdf2 = async () => {
        // Show spinner on the button
        setIsPdfLoading(true)

        const iframe = document?.querySelector("iframe") as HTMLIFrameElement | null
        const iframeWin = iframe?.contentWindow as (Window & typeof globalThis) | null

        if (!iframeWin) {
            setIsPdfLoading(false)
            console.error('Iframe window not available for print')
            return
        }

        let cleared = false
        const clearLoading = () => {
            if (cleared) return
            cleared = true
            try {
                iframeWin.removeEventListener('afterprint', clearLoading)
            } catch (e) {}
            setIsPdfLoading(false)
        }

        // Some browsers/firefox will fire afterprint on the same window
        try {
            iframeWin.addEventListener('afterprint', clearLoading)
        } catch (e) {
            // ignore
        }

        try {
            iframe?.focus()
            // trigger print; on most browsers afterprint will fire when the print dialog closes
            iframeWin.print()
        } catch (err) {
            console.error('print failed', err)
            clearLoading()
        }

        // Fallback: if afterprint doesn't fire for some reason, clear after 8s
        setTimeout(() => {
            clearLoading()
        }, 8000)
    }

    const handleSharePdf = async () => {
        setIsSharing(true)
        try {
            if (!iframeSrc) throw new Error('Fonte do PDF não definida')

            const Const_iframeSrcModified = iframeSrc.replace('/api', process.env.NEXT_PUBLIC_Env_urlApiBackend || 'UrlErro')
            const url = Const_iframeSrcModified + (Const_iframeSrcModified.includes('?') ? '&pdf=true' : '?pdf=true')

            const res = await fetch(url, { credentials: 'include' })
            if (!res.ok) throw new Error('Falha no download para compartilhar: ' + res.status)

            const buffer = await res.arrayBuffer()

            // tenta extrair filename
            let filename = 'documento.pdf'
            try {
                const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition')
                if (cd) {
                    const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)
                    if (match && match[1]) filename = decodeURIComponent(match[1])
                }
            } catch (e) {}

            const file = new File([buffer], filename, { type: 'application/pdf' })

            // usar Web Share API level 2 se suportada
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    // titulo/texto opcional
                    await (navigator as any).share({ files: [file], title: filename, text: 'Compartilhando avaliação' })
                    // compartilhou com sucesso (não há callback visível além de sucesso)
                } catch (err) {
                    // usuário cancelou ou erro no share
                    console.error('Erro ao compartilhar:', err)
                    throw err
                }
            } else {
                // fallback: inicia download e informa usuário
                console.warn('Web Share API com arquivos não suportada neste navegador — fazendo download como fallback')
                const objectUrl = URL.createObjectURL(file)
                const link = document?.createElement('a')
                link.href = objectUrl
                link.download = filename
                document?.body.appendChild(link)
                link.click()
                link.remove()
                setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
            }

        } catch (err) {
            console.error('Erro ao preparar compartilhamento:', err)
            // opcional: mostrar um Snippet/alerta
        } finally {
            setIsSharing(false)
        }
    }

	useEffect(() => {
		const storedEndTime = localStorage.getItem('t')
		let endTime = new Date()

		if (storedEndTime) {
			endTime = new Date(storedEndTime)
		}

		const interval = setInterval(() => {
			const now = new Date()
			const timeDifference = endTime.getTime() - now.getTime()

			if (timeDifference <= 0) {
				endTime = new Date()
				endTime.setMinutes(endTime.getMinutes() + 10)
				localStorage.setItem('t', endTime.toString())
				setTimeRemaining(10 * 60)
			} else {
				setTimeRemaining(Math.floor(timeDifference / 1000))
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	const formatTime = (timeInSeconds: number) => {
		const hours = Math.floor(timeInSeconds / 3600)
		const minutes = Math.floor((timeInSeconds % 3600) / 60)
		const seconds = timeInSeconds % 60
        //${hours.toString().padStart(2, '0')}:
		return `${minutes.toString()/* .padStart(2, '0') */}:${seconds.toString().padStart(2, '0')}`
	}

	const openModalWithSrc = (item: Type_allModifiedList | null, src: string, idQuestionarioAluno: string, sck: string, Parameter_priceModal?: number, Parameter_priceHigherModal?: number) => {
        setPreviewItem(item)
		setContentIdQuestionarioAluno(idQuestionarioAluno)
		if (Parameter_priceModal && Parameter_priceHigherModal) {
			setPriceModal(Parameter_priceModal)
			setPriceHigherModal(Parameter_priceHigherModal)
		}
		else {
			setPriceModal(0)
			setPriceHigherModal(0)
		}
		setIframeSrc(src)
        setSck(sck)
		setIsLoading(true)
		onOpen()
		history.pushState(null, "modal", window.location.pathname)
	}

	const handleIframeLoad = () => {
	  setIsLoading(false)
	}

	const handleBackButtonMobile = () => {
		if (isOpen) {
			onClose()
		}
		if (isCheckoutOpen) {
			// Fecha o modal do FancyBox se estiver aberto
			if (typeof (window as any)?.jQuery?.fancybox?.close === 'function') {
				(window as any)?.jQuery?.fancybox?.close()
			}
			setIsCheckoutOpen(false)
		}
	}

	const handleBackButton = () => {
		if (isOpen) {
			onClose()
			history.back()
		}
	}

	useEffect(() => {
	  window.addEventListener('popstate', handleBackButtonMobile);
	  return () => {
		window.removeEventListener('popstate', handleBackButtonMobile);
	  }
	}, [isOpen, isCheckoutOpen])

	function addItemToCartOrRemove(Let_idQuestionarioAluno: string) {
		if (cart.includes(Let_idQuestionarioAluno)) {
			removeItemToCart(Let_idQuestionarioAluno)
		} else {
			addItemToCart(Let_idQuestionarioAluno)
		}
	}

    useEffect(() => {
        if (isDataLibrary?.createdAt) {
            setIsInitialLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/library${isInfUser?.nm_polo ? `?nmPolo=${isInfUser.nm_polo}` : ''}`, {credentials: 'include'})
                if (!response.ok) {
                     throw new Error('Falha ao buscar dados')
                }
                const result = await response.json() as {data: Type_allModifiedList[], createdAt: string}
                
                isDoneRef.current = true
                setLoadingProgress(100)
                setLoadingMessage("Concluído!")
                await new Promise(resolve => setTimeout(resolve, 800))
                
                setDataLibrary(result)
                setIsInitialLoading(false)
            } catch (error) {
                 isDoneRef.current = true
                 setLoadingProgress(100)
                 setIsInitialLoading(false)
                 setShowError(true)
                 setTimeout(() => setShowError(false), 5000)
            }
        }

        fetchData()
	}, [])

    const [syncProgress, setSyncProgress] = useState(0)
    const [syncMessage, setSyncMessage] = useState("Iniciando...")

    const loadingMessages = [
        "Carregando suas informações...",
        "Confirmando dados do aluno...",
        "Localizando provas disponíveis...",
        "Organizando seu histórico de avaliações...",
        "Preparando conteúdo para visualização...",
        "Verificando permissões de acesso...",
        "Reunindo arquivos das provas...",
        "Atualizando lista de disciplinas...",
        "Sincronizando conteúdos recentes...",
        "Ajustando layout de exibição...",
        "Aplicando filtros do seu perfil...",
        "Checando disponibilidade dos arquivos...",
        "Otimizando carregamento das provas...",
        "Validando dados cadastrados...",
        "Finalizando preparação do ambiente de estudo..."
    ];

    useEffect(() => {
        if (!isInitialLoading) return

        const startTime = Date.now()
        const timeConstant = 15000 // 15s tau for exponential growth

        const interval = setInterval(() => {
            if (isDoneRef.current) return

            const elapsed = Date.now() - startTime
            // Exponential approach to 99%
            // progress = 100 * (1 - e^(-elapsed / tau))
            const rawProgress = 100 * (1 - Math.exp(-elapsed / timeConstant))
            const progress = Math.min(rawProgress, 99)
            
            setLoadingProgress(progress)
            setLoadingTime(Math.floor(elapsed / 1000))

            // Message rotation every 4s
            const messageIndex = Math.floor(elapsed / 4000) % loadingMessages.length
            setLoadingMessage(loadingMessages[messageIndex])
        }, 100)

        return () => clearInterval(interval)
    }, [isInitialLoading])

	function simpleScramble(str: string, key: string) {
		if (typeof str !== 'string' || typeof key !== 'string') {
			return str || ''
		}
		const chars = '5a0b2u8d9c1s4o7m6e3n01a9u8s5m4c2d6e7bno';
		let seed = 0;

		// cria uma semente simples a partir da key
		for (let i = 0; i < key.length; i++) {
			seed = (seed + key.charCodeAt(i)) % 1000;
		}

		let result = '';
		for (let i = 0; i < str.length; i++) {
			const c = str[i].toLowerCase();
			const index = chars.indexOf(c);
			if (index === -1) {
			// se não for [a-z0-9], mantém igual
			result += c;
			} else {
			// muda o caractere baseado na seed e posição
			const newIndex = (index + seed + i) % chars.length;
			result += chars[newIndex];
			}
		}

		return result;
	}

    const [showSyncSuccess, setShowSyncSuccess] = useState(false)
    const [showError, setShowError] = useState(false)

    async function updateDataLibrary() {
        let interval: NodeJS.Timeout
        try {
            setIsUpdating(true)
            setSyncProgress(0)
            setSyncMessage(loadingMessages[0])
            
            // Start simulation
            const startTime = Date.now()
            const timeConstant = 15000
            interval = setInterval(() => {
                const elapsed = Date.now() - startTime
                const rawProgress = 100 * (1 - Math.exp(-elapsed / timeConstant))
                setSyncProgress(Math.min(rawProgress, 99))
                const messageIndex = Math.floor(elapsed / 4000) % loadingMessages.length
                setSyncMessage(loadingMessages[messageIndex])
            }, 100)

            const response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/library?updateCache=true${isInfUser?.nm_polo ? `&nmPolo=${isInfUser.nm_polo}` : ''}`, {credentials: 'include'})
            if (!response.ok) {
                throw new Error('Falha na atualização')
            }
            const result = await response.json() as {data: Type_allModifiedList[], createdAt: string}
            
            // Finish
            clearInterval(interval)
            setSyncProgress(100)
            setSyncMessage("Concluído!")
            
            // Small delay to show 100%
            await new Promise(resolve => setTimeout(resolve, 800))

            setDataLibrary(result)
            setShowSyncSuccess(true)
            setTimeout(() => setShowSyncSuccess(false), 10000) // Hide after 3 seconds
        }
        catch (error) {
            alert('Seu agendamento foi encontrado, porem nenhuma avaliação dele foi postada ainda.')
        }
        finally {
            if(interval!) clearInterval(interval)
            setIsUpdating(false)
        }
    }

    function Function_createSckNew(cpf: string, cdDisciplina: string, dsTipoOportunidade: string, nrModulo: number | string, nrAno: number | string): string {
        // 1. CPF: Primeiros 11 dígitos
        const cpfParte = String(cpf)?.toLowerCase()?.replace(/[^a-zA-Z0-9|_]/g, '')?.slice(0, 11);

        // 2. Disciplina: Remove 'egrad_', remove caracteres especiais e lowercase
        const disciplinaParte = String(cdDisciplina)?.toLowerCase()?.replace('egrad_', '')?.replace(/[^a-zA-Z0-9]/g, '');

        // 3. Tipo Oportunidade: 2 primeiros caracteres
        const tipoParte = String(dsTipoOportunidade)?.toLowerCase()?.replace(/[^a-zA-Z0-9|_]/g, '')?.substring(0, 2);

        // 4. Módulo: Número normal (convertido para string)
        const moduloParte = String(nrModulo)?.toLowerCase()?.replace(/[^a-zA-Z0-9|_]/g, '');

        // 5. Ano: Apenas o último dígito
        const anoParte = String(nrAno)?.toLowerCase()?.replace(/[^a-zA-Z0-9|_]/g, '')?.toString()?.slice(-1);

        // Junta todas as partes
        const resultado = (cpfParte + disciplinaParte + tipoParte + moduloParte + anoParte)

        // Preenche com '0' à direita até completar 35 caracteres
        return resultado?.padEnd(35, '0');
    }

    function Function_createSck(Parameter_allModifiedList: Type_allModifiedList): string {
        // 45473389813,egrad_arqh080_030|2oportunidade|53|2026
        // 45473389813 egrad_arqh080_030 2oportunidade 53 2026
        // cpf -> primeiros 11 dígitos
        // cdDisiplina -> remove "egrad_" depois remove caracteres especiais e deixa em lowercase
        // dsTipoOportunidade -> 2 primeiros caracteres
        // nrModulo -> numero normal
        // nrAno -> o ultimo digito
        // preenche a direita de 0 ate dar 35 caracteres
        // result -> 45473389813arqh0800302o535000000000
        const Const_cleanCdDisciplina = Parameter_allModifiedList.cdDisciplina.replace(/[^a-zA-Z0-9|_]/g, '')?.toLowerCase()
        const Const_cleanDsTipoOportunidade = Parameter_allModifiedList.dsTipoOportunidade.replace(/[^a-zA-Z0-9|_]/g, '')?.toLowerCase() //2o
        const Const_cleanNrModulo = String(Parameter_allModifiedList.nrModulo).replace(/[^a-zA-Z0-9|_]/g, '')?.toLowerCase() //53
        const Const_cleanNrAno = String(Parameter_allModifiedList.nrAno).replace(/[^a-zA-Z0-9|_]/g, '')?.toLowerCase() //5

        return `${Parameter_allModifiedList.cdCpf},${Const_cleanCdDisciplina}|${Const_cleanDsTipoOportunidade}|${Const_cleanNrModulo}|${Const_cleanNrAno}`;
    }

    const formatTitle = (title: string) => {
        return title.split(' ').map(word => {
            if (word.length <= 2) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    return (
        <>
            {/* <Script
                id="hotmart-widget-script"
                src="https://static.hotmart.com/checkout/widget.min.js"
                strategy="lazyOnload"
            /> */}
            <Modal 
                isOpen={isOpen} 
                placement="center" 
                classNames={{closeButton: "hidden"}}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut"
                            }
                        },
                        exit: {
                            y: -800,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn"
                            }
                        }
                    }
                }}
            >
                <ModalContent className="!m-0 h-[100svh] md:h-[calc(100svh-20px)] w-[900px] md:!mr-[15px] md:!ml-[15px] max-w-full rounded-none md:rounded-[12px]">
                    <ModalHeader className="flex justify-between items-center flex-wrap gap-3 pb-3">
                        <h1 className="font-light tracking-[0.5px] text-[22px] mb-0.5 flex flex-wrap">
                            Compartilhada por&nbsp; 
                            <span className="font-normal">
                                @{simpleScramble('87sdh78'/* isInfUser.user_uuid?.split("-")[0] */, contentIdQuestionarioAluno)}
                            </span>
                        </h1>
                        {priceModal > 0 ? null :
                            <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded">
                                <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-700">
                                    <strong>Aviso:</strong> Estude a resposta completa, na prova real as questões e alternativas podem estar embaralhadas.
                                </div>
                            </div>
                        }
                        <div className="flex gap-4 ml-auto items-center">
                            {priceModal > 0 ? 
                                <div className="text-danger font-medium">
                                    OFERTA - termina em <span className="font-semibold">{formatTime(timeRemaining)}</span>
                                </div>
                                :
                                <>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={handleGeneratePdf} isLoading={isPdfLoading} variant="ghost" color="primary" className="tracking-[0.5px] text-[16px]">
                                            {isPdfLoading ? 'Baixando...' : 'Baixar PDF'}
                                        </Button>
                                        {/* <Button onClick={handleSharePdf} isLoading={isSharing} variant="ghost" color="primary" className="tracking-[0.5px] text-[16px]">
                                            {isSharing ? 'Compartilhando...' : 'Compartilhar'}
                                        </Button> */}
                                    </div>
                                </>
                            }
                            <Button onClick={handleBackButton} variant="ghost" color="danger" className="tracking-[0.5px] text-[16px]">
                                Voltar
                            </Button>
                        </div>
                    </ModalHeader>
                    <ModalBody className="!m-3 !p-0 flex justify-center relative shadow-medium rounded-[4px] !pb-px" style={{ border: "1px solid hsl(0deg 0% 0% / 100%)" }}>
                        {isLoading && ( 
                            <Spinner 
                                className="mb-[150px]" 
                                label="Buscando..." 
                                color="primary" 
                                classNames={{
                                    wrapper: "w-[70px] h-[70px]",
                                    circle1: "border-[6px]",
                                    circle2: "border-[6px]",
                                    label: "text-[20px] mt-[8px] tracking-[1px]"
                                }}
                            />
                        )}
                        <iframe
                            ref={reportTemplateRef}
                            src={iframeSrc}
                            className="!m-0 !p-0 w-auto h-full"
                            style={{ display: isLoading ? "none" : "block" }}
                            onLoad={handleIframeLoad}
                        />
                        {priceModal > 0 && (
                            <Button 
                                onClick={(e) => {
                                    handleOpenCheckout(previewItem)
                                }}
                                isLoading={isBuying}
                                spinner={<Spinner size='sm' color="white" className="order-2 mt-[-2px] mb-[-14px] ml-[-12px]" />}
                                variant="solid" 
                                color="success" 
                                className="animate-bounce gap-1 absolute max-w-full w-[300px] h-[85px] flex flex-col justify-center top-[75%] left-[calc(50%_-_150px)] text-lg text-white font-bold transition-all"
                            >
                                <span className="order-1 letter-spacing-2">
                                    VER COMPLETO AGORA!
                                </span>
                                <div className="order-3 flex flex-row flex-nowrap items-baseline justify-between w-[68%]">
                                    <span className="text-[hsl(0,100%,50%)] mb-0.5 items-end font-medium text-lg relative before:rotate-[17deg] before:absolute before:content-[''] before:top-[47%] before:left-[-5px] before:w-[calc(95%+14px)] before:h-[1px] before:bg-[hsl(0,100%,50%,0.9)] before:text-[10px] after:rotate-[343deg] after:absolute after:content-[''] after:top-[47%] after:left-[-5px] after:w-[calc(95%+14px)] after:h-[1px] after:bg-[hsl(0,90%,49%,0.9)] after:text-[10px]">
                                        R$ {priceHigherModal?.toFixed(2)?.split(".")?.[0] || "??"}<span className="text-[12px]">,{priceHigherModal?.toFixed(2)?.split(".")?.[1] || "??"}</span>
                                    </span>
                                    <div className="flex flex-row flex-nowrap items-baseline">
                                        <span className="text-white text-[22px]">
                                            R$ {priceModal?.toFixed(2)?.split(".")?.[0] || "??"}<span className="text-[16px]">,{priceModal?.toFixed(2)?.split(".")?.[1] || "??"}</span>
                                        </span>
                                    </div>
                                </div>
                            </Button>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Payment Modal */}
            <Modal 
                isOpen={isPaymentModalOpen} 
                onOpenChange={handlePaymentModalOpenChange}
                placement="center"
                backdrop="blur"
                size="full"
                classNames={{
                    base: "!rounded-lg h-[100dvh] md:h-auto md:min-h-[500px] md:max-w-2xl md:rounded-3xl !shadow-2xl",
                    closeButton: "hover:bg-default-100 active:bg-default-200",
                }}
            >
                <ModalContent>
                    {(onClosePayment) => (
                        <>
                            {paymentStep === 'method_selection' ? (
                                <ModalBody className="gap-6 pt-6 pb-40 md:py-10 flex flex-col justify-center">
                                    <div className="flex flex-col gap-6 w-full mx-auto">
                                        {/* Header Group - grouped with siblings */}
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-xl font-bold leading-tight text-left">
                                                {formatTitle(checkoutItem?.nmQuestionario || '')}
                                            </h2>
                                            <div className="flex items-center justify-start gap-2 text-default-500 text-sm">
                                                <Calendar size={16} />
                                                <span className="font-medium">
                                                    {checkoutItem?.dtAvaliacao} • {checkoutItem?.hrInicial} - {checkoutItem?.hrFinal}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Buttons Group - Gap X (3) vs Header 2X (6) */}
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="h-20 px-4 justify-between items-center bg-primary-50 hover:bg-primary-100 border-1 border-primary-200"
                                                variant="flat"
                                                color="primary"
                                                onPress={handlePixPayment}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 rounded-full bg-white text-primary shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-qr-code"><rect width="5" height="5" x="3" y="3"/><rect width="5" height="5" x="16" y="3"/><rect width="5" height="5" x="3" y="16"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <span className="text-lg font-bold text-primary-900">Pix (Instantâneo)</span>
                                                        <span className="text-xs font-medium text-primary-600">Liberação imediata</span>
                                                    </div>
                                                </div>
                                                {/* <CheckCircle2 size={24} className="text-primary" /> */}
                                            </Button>

                                            {!showCardMaintenance ? (
                                                <Button
                                                    className="h-20 px-4 justify-between items-center bg-default-50 hover:bg-default-100 border-1 border-default-200"
                                                    variant="flat"
                                                    color="primary"
                                                    onPress={() => setShowCardMaintenance(true)}
                                                >
                                                    <div className="flex items-center gap-4 opacity-70">
                                                        <div className="p-2.5 rounded-full bg-white text-default-500 shadow-sm">
                                                            <CreditCard size={24} />
                                                        </div>
                                                        <div className="flex flex-col items-start gap-0.5">
                                                            <span className="text-lg font-bold text-default-700">Cartão de Crédito</span>
                                                            <span className="text-xs font-medium text-default-500">Até 6x sem juros</span>
                                                        </div>
                                                    </div>
                                                </Button>
                                            ) : (
                                                <div className="animate-appearance-in p-4 rounded-xl bg-warning-50 border-1 border-warning-200 flex items-start gap-3">
                                                    <div className="mt-0.5 p-1 rounded-full bg-warning-100">
                                                        <AlertCircle size={18} className="text-warning-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold text-warning-800">Opção de cartão de crédito está em manutenção</span>
                                                        <p className="text-xs text-warning-700 leading-relaxed">
                                                            A gente notou algumas falhas no pagamento por cartão e, para evitar transtornos, decidimos pausar essa opção por enquanto. 
                                                            Se puder, use o <span className="font-bold">Pix</span> até resolvermos. Obrigado pela compreensão!
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ModalBody>
                            ) : (
                                <>
                                    <ModalHeader className="flex flex-col gap-1 pb-0">
                                        <div className="flex flex-col items-center gap-0">
                                            <span className="text-sm font-semibold text-default-500 uppercase tracking-wider">Beneficiário</span>
                                            <span className="text-lg font-bold text-default-900">Rafael Silva</span>
                                        </div>
                                    </ModalHeader>
                                    <ModalBody className="pt-6 md:py-10 flex flex-col justify-center">
                                        <div className="flex flex-col items-center gap-6 justify-center h-full">
                                            {isLoadingPix ? (
                                                <div className="flex flex-col items-center justify-center py-10 gap-4">
                                                    <Spinner size="lg" color="primary" />
                                                    <p className="text-sm text-default-500 font-medium animate-pulse">
                                                        Gerando QR Code Pix...
                                                    </p>
                                                </div>
                                            ) : isPaymentComplete ? (
                                                <div className="flex flex-col items-center justify-center w-full gap-6 animate-appearance-in py-10">
                                                    <div className="w-24 h-24 rounded-full bg-success-50 flex items-center justify-center border-2 border-success-100">
                                                        <CheckCircle2 size={48} className="text-success" />
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center text-center gap-2">
                                                        <h3 className="text-2xl font-bold text-success-600">Pagamento Confirmado!</h3>
                                                        <p className="text-default-500 text-sm max-w-[280px]">
                                                            Seu acesso foi liberado com sucesso. Atualizando a página em alguns instantes...
                                                        </p>
                                                    </div>
                                                    <Spinner size="md" color="success" className="mt-2" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center w-full gap-6">
                                                    <div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                                        {pixCode && <QRCode value={pixCode} size={200} />}
                                                    </div>
                                                    
                                                    <div className="w-full flex flex-col gap-3">
                                                        <Snippet 
                                                            symbol="" 
                                                            codeString={pixCode}
                                                            hideCopyButton
                                                            className="w-full bg-default-100 border border-default-200"
                                                            classNames={{
                                                                pre: "font-mono text-xs text-default-600 truncate text-center",
                                                                base: "p-4 px-7 rounded-xl justify-center" 
                                                            }}
                                                        >
                                                            <span className="text-xs text-default-500 truncate max-w-[400px] md:max-w-full block text-center mx-auto">
                                                                {pixCode}
                                                            </span>
                                                        </Snippet>
                                                        
                                                        <Button
                                                            size="lg"
                                                            className={`w-full h-14 font-medium text-base transition-all duration-300 ${pixCopied ? 'bg-success text-white shadow-success/20' : 'bg-primary text-white shadow-primary/20'}`}
                                                            variant="shadow"
                                                            startContent={pixCopied ? <CheckCircle2 size={22} /> : <Copy size={22} />}
                                                            onPress={copyPixCode}
                                                        >
                                                            {pixCopied ? "Código Copiado!" : "Copiar Código Pix"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ModalBody>
                                </>
                            )}
                            <ModalFooter className="pt-2 pb-6 md:pb-10">
                                <Button 
                                    color="danger" 
                                    variant="flat" 
                                    onPress={onClosePayment}
                                    isDisabled={isPaymentComplete}
                                    className="h-12 font-medium bg-danger-50 text-danger hover:bg-danger-100 hover:text-danger-600 transition-colors"
                                    fullWidth
                                >
                                    Cancelar Compra
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto px-6">
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-lg font-medium text-default-700 animate-pulse">{loadingMessage}</span>
                            <span className="text-sm font-mono text-default-500">
                                {Math.floor(loadingProgress)}%
                            </span>
                        </div>
                        <Progress 
                            size="lg"
                            radius="sm"
                            classNames={{
                                base: "max-w-md",
                                track: "drop-shadow-md border border-default",
                                indicator: "bg-gradient-to-r from-primary-400 to-primary-600",
                                label: "tracking-wider font-medium text-default-600",
                                value: "text-foreground/60"
                            }}
                            value={loadingProgress}
                            showValueLabel={false}
                        />
                        <div className="flex flex-col items-center gap-1 mt-4">
                            <p className="text-center text-sm font-medium text-default-500">
                                Carregamento inicial
                            </p>
                            {intervalData?.startInterval && intervalData?.endInterval && (
                                <p className="text-center text-sm font-medium text-default-500">
                                    Período de busca {intervalData.startInterval} até {intervalData.endInterval}
                                </p>
                            )}
                            <p className="text-center text-xs text-default-400">
                                Este processo é realizado apenas uma vez. Os próximos acessos serão instantâneos.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8 md:gap-10 mb-14 relative">
                    {showSyncSuccess && (
                        <div className="fixed top-4 right-4 z-50 animate-fade-in">
                            <Snippet 
                                hideSymbol 
                                hideCopyButton
                                variant="flat" 
                                color="success"
                                className="px-4 py-3 bg-success-50"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-success" />
                                    <span className="text-success">Conteúdo sincronizado com sucesso!</span>
                                </div>
                            </Snippet>
                        </div>
                    )}
                    {showError && (
                        <div className="fixed top-4 right-4 z-50 animate-fade-in">
                            <Snippet 
                                hideSymbol 
                                hideCopyButton
                                variant="flat" 
                                color="danger"
                                className="px-4 py-3 bg-danger-50"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={18} className="text-danger" />
                                    <span className="text-danger">Erro ao carregar conteúdo. Tente novamente.</span>
                                </div>
                            </Snippet>
                        </div>
                    )}
                    {isInfUser?.admin && (
                        <div className="flex gap-2 text-warning-500 font-bold mb-[-24px] items-end text-sm">
                            <AlertCircle size={18} className="mt-[3px]" />
                            <span>Você está visualizando como administrador.</span>
                        </div>
                    )}
                    {/* {isDataLibrary?.createdAt && (
                        <div className="flex items-start gap-2 text-default-400 text-sm">
                            <Clock size={14} className="text-default-400 mt-[3px]" />
                            <span>
                                Última sincronização <span className="font-semibold text-black/50">
                                    {formatDistanceToNow(new Date(isDataLibrary.createdAt), {
                                        addSuffix: true,
                                        locale: ptBR
                                    })}
                                </span>
                                {intervalData?.startInterval && intervalData?.endInterval && (
                                    <span className="block text-xs text-default-400">
                                        Período de busca {intervalData.startInterval} até {intervalData.endInterval}
                                    </span>
                                )}
                                <span
                                    className="text-primary cursor-pointer block mt-1"
                                    onClick={(e) => {document?.getElementById('sincronizacaoBox')?.scrollIntoView({ block: "start", behavior: "smooth", inline: "nearest"})}}
                                >Sincronizar Agora</span>
                            </span>
                        </div>
                    )} */}
                    <div className="flex flex-col gap-10 md:gap-12 w-full max-w-[1000px] mx-auto">
                        {(!isDataLibrary?.data || isDataLibrary.data.length === 0) ? (
                            <Card className="to-default-100 border-none shadow-lg p-6">
                                <CardBody className="flex flex-col items-center gap-6 py-12">
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <GraduationCap size={40} className="text-primary" />
                                    </div>
                                    <div className="text-center max-w-[600px]">
                                        <h3 className="text-xl font-semibold text-default-900 mb-3">
                                            Nenhuma postagem feita até o momento
                                        </h3>
                                        <p className="text-default-600 leading-relaxed">
                                            {/* Para visualizar as provas, primeiro é necessário agendar ela 
                                            através da plataforma. Após o agendamento, clique no botão "Sincronizar" 
                                            abaixo para atualizar sua biblioteca e ver a prova desbloqueada. */}
                                            Caso algum grupo de alunos tenha postado algum conteúdo relevante, ele aparecerá aqui.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 mt-2 w-full justify-center">
                                        {isUpdating ? (
                                            <div className="w-full max-w-[300px] flex flex-col gap-2">
                                                <div className="flex justify-between text-xs text-default-500">
                                                    <span>{syncMessage}</span>
                                                    <span>{Math.floor(syncProgress)}%</span>
                                                </div>
                                                <Progress 
                                                    size="md" 
                                                    value={syncProgress} 
                                                    classNames={{
                                                        indicator: "bg-gradient-to-r from-primary-400 to-primary-600"
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <></>
                                            
                                        )}
                                        {/* <Button
                                                variant="ghost"
                                                color="primary"
                                                onClick={updateDataLibrary}
                                                className="font-medium"
                                            >
                                                Sincronizar Agora
                                            </Button> */}
                                    </div>
                                </CardBody>
                            </Card>
                        ) : isDataLibrary.data.map((Let_answerSheet, index) => (
                            <Card 
                                id={`card_prova_${index}`}
                                key={index} 
                                isPressable
                                onPress={(e) => {
                                    const btnId = `btn_prova_${Let_answerSheet?.idQuestionarioAluno}`;
                                    const btn = document?.getElementById(btnId);
                                    if (btn) {
                                        btn.click();
                                    }
                                }}
                                className="relative rounded-2xl flex flex-col md:flex-row items-stretch w-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 ease-out transform-gpu overflow-visible border-[3px] border-default-400 hover:border-primary/50 cursor-pointer active:scale-[0.95]">

                                {isInfUser?.admin && (
                                    <div 
                                        // 1. Evita que o clique no texto acione o onPress do Card
                                        onClick={(e) => e.stopPropagation()}
                                        // 2. Evita que o início da seleção (mouse down) acione efeitos de clique do Card
                                        onMouseDown={(e) => e.stopPropagation()}
                                        // 3. Estilos de cursor e seleção
                                        className="absolute top-[-35px] left-0 flex gap-2 text-warning-500 font-bold mb-[-24px] items-end text-sm cursor-text select-text z-20"
                                    >
                                        <AlertCircle size={18} className="mt-[3px] pointer-events-none" />
                                        <span className="select-text"> 
                                            \/ SCK: {Function_createSckNew(Let_answerSheet.cdCpf, Let_answerSheet.cdDisciplina, Let_answerSheet.dsTipoOportunidade, Let_answerSheet.nrModulo, Let_answerSheet.nrAno)} \/ 
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const sck = Function_createSckNew(Let_answerSheet.cdCpf, Let_answerSheet.cdDisciplina, Let_answerSheet.dsTipoOportunidade, Let_answerSheet.nrModulo, Let_answerSheet.nrAno);
                                                navigator.clipboard.writeText(sck);
                                                alert("Copiado!");
                                            }}
                                            className="ml-2 hover:text-warning-600 active:scale-90 transition-transform"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="absolute right-2 top-2 flex gap-2">
                                    {Let_answerSheet?.acquired && <CheckCircle2 size={20} className="text-success" />}
                                    {Let_answerSheet?.status === "active" && <ShieldCheck size={20} className="text-primary" />}
                                </div>
                                <CardHeader className="flex flex-col items-start gap-4 pr-6 pl-6 pt-6 pb-5 border-b-[3px] border-r-0 md:border-b-0 md:border-r-[3px] border-default-300 w-full md:w-[40%] border-dashed rounded-t-xl md:rounded-t-none rounded-l-none md:rounded-l-xl">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={24} className="text-primary" />
                                            <h1 className="text-xl font-semibold text-default-900 text-left">
                                                {Let_answerSheet?.nmQuestionario || "Matéria não identificada"}
                                            </h1>
                                        </div>
                                        <div className="flex items-center gap-2 text-default-600">
                                            {<User size={16} />}
                                            {/* <span>Período {Let_answerSheet?.nrModulo || "00"}/{Let_answerSheet?.nrAno || "0000"}</span> */}
                                            Compartilhada por @{simpleScramble('87sdh78'/* isInfUser.user_uuid?.split("-")[0] */, String(Let_answerSheet?.idQuestionarioAluno))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 mt-2">
                                        <div className="flex items-center gap-2 text-default-700">
                                            <AlertCircle size={16} />
                                            <span className="font-medium">
                                                {Let_answerSheet?.dsTipoOportunidade || "0ª Oportunidade"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-default-700">
                                            <TimerIcon size={16} />
                                            <span className="font-medium">
                                                {Let_answerSheet?.dtAvaliacao} • {Let_answerSheet?.hrInicial} - {Let_answerSheet?.hrFinal}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {(new Date(`${(Let_answerSheet.dtAvaliacao || '').split('/')[2]}-${(Let_answerSheet.dtAvaliacao || '').split('/')[1]}-${(Let_answerSheet.dtAvaliacao || '').split('/')[0]}T${Let_answerSheet.hrFinal}`) <= new Date()) ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/20 text-danger-700 text-sm font-medium">
                                                    <Bookmark size={14} />
                                                    Prova já realizada
                                                </span>
                                            ) : (new Date(`${(Let_answerSheet.dtAvaliacao || '').split('/')[2]}-${(Let_answerSheet.dtAvaliacao || '').split('/')[1]}-${(Let_answerSheet.dtAvaliacao || '').split('/')[0]}T${Let_answerSheet.hrInicial}`) <= new Date()) ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/20 text-warning-700 text-sm font-medium">
                                                    <Clock size={14} />
                                                    Prova sendo realizada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success-700 text-sm font-medium">
                                                    <Lock size={14} />
                                                    Prova ainda não realizada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="flex flex-col gap-4 pr-6 pl-6 pt-4 pb-4 border-b-[3px] border-r-0 md:border-b-0 md:border-r-[3px] border-default-300 justify-center items-center border-dashed">
                                    {((Let_answerSheet?.idQuestionarioAluno?.toString()?.length || 0) >= 5) || (Let_answerSheet?.status === "active") ? (
                                        calculateTimeUntilExam(Let_answerSheet?.dtAvaliacao, (Let_answerSheet?.hrInicial || '')) > 720 ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="p-3 rounded-full bg-default-100">
                                                    <Clock size={32} className="text-default-400" />
                                                </div>
                                                <div className="flex flex-col items-center gap-1 text-center">
                                                    <span className="text-default-600 text-[15px]">
                                                        Disponível 720h antes da prova
                                                    </span>
                                                    <span className="text-primary font-semibold text-lg">
                                                        Faltam {formatTimeUntilExam(calculateTimeUntilExam(Let_answerSheet?.dtAvaliacao, (Let_answerSheet?.hrInicial || '')) - 720)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : Let_answerSheet?.acquired ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="rounded-full">
                                                    <CheckCircle2 size={32} className="text-success" />
                                                </div>
                                                <span className="text-success text-xl font-semibold text-center">
                                                    Desbloqueado
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-center">
                                                    {/* <div className="text-sm text-default-500 mb-1">Oferta Especial</div> */}
                                                    <div className="text-danger font-medium">
                                                        OFERTA - termina em <span className="font-semibold">{formatTime(timeRemaining)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="text-danger line-through text-sm">
                                                        R$ {Let_answerSheet?.status === "active" ? "78,40" : "78,40"}
                                                    </div>
                                                    <div className="text-3xl text-success font-mono">
                                                        R$ {Let_answerSheet?.pricing?.toFixed(2)?.split(".")?.[0] || "??"}<span className="text-xl">,{Let_answerSheet?.pricing?.toFixed(2)?.split(".")?.[1] || "??"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="p-3 rounded-full bg-default-100">
                                                <AlertCircle size={32} className="text-default-400" />
                                            </div>
                                            <span className="text-default-500 text-lg text-center">
                                                Prova não disponível no momento
                                            </span>
                                        </div>
                                    )}
                                </CardBody>
                                <CardFooter className="flex flex-col gap-3 pr-6 pl-6 pt-5 pb-6 justify-center items-stretch rounded-b-xl md:rounded-b-none rounded-r-none md:rounded-r-xl">
                                    {((Let_answerSheet?.idQuestionarioAluno?.toString()?.length || 0) >= 5) || (Let_answerSheet?.status === "active") ? (
                                        calculateTimeUntilExam(Let_answerSheet?.dtAvaliacao, (Let_answerSheet?.hrInicial || '')) > 720 ? (
                                            <Button 
                                                disabled
                                                variant="flat" 
                                                color="default" 
                                                className="h-12 font-medium text-[15px] tracking-wide bg-default-100"
                                                startContent={<Clock size={18} />}
                                            >
                                                Disponível 720h antes da prova
                                            </Button>
                                        ) : Let_answerSheet?.acquired ? (
                                            <Button 
                                                id={`btn_prova_${Let_answerSheet?.idQuestionarioAluno}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModalWithSrc(
                                                        Let_answerSheet,
                                                        `/api/answer-sheet?jwtInf=${Let_answerSheet?.jwtInf || 0}&timestamp=${Date.now()}`, 
                                                        String(Let_answerSheet?.idQuestionarioAluno),
                                                        Function_createSck(Let_answerSheet)
                                                    );
                                                }} 
                                                variant="shadow" 
                                                color="primary" 
                                                className="h-12 font-medium text-[15px] tracking-wide bg-primary hover:bg-primary-600 active:bg-primary-700 text-white shadow-lg hover:shadow-primary/40"
                                                startContent={<Eye size={18} />}
                                            >
                                                Ver Completo
                                            </Button>
                                        ) : (
                                            <>
                                                <Button 
                                                    id={`btn_prova_${Let_answerSheet?.idQuestionarioAluno}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModalWithSrc(
                                                            Let_answerSheet,
                                                            `/api/answer-sheet?jwtInf=${Let_answerSheet?.jwtInf || 0}&timestamp=${Date.now()}`, 
                                                            String(Let_answerSheet?.idQuestionarioAluno), 
                                                            Function_createSck(Let_answerSheet),
                                                            Let_answerSheet?.pricing, 
                                                            (Let_answerSheet?.status === "active" ? 78.40 : 78.40)
                                                        );
                                                    }} 
                                                    variant="shadow" 
                                                    color="secondary"
                                                    className="h-12 font-medium text-[15px] tracking-wide bg-secondary hover:bg-secondary/90 active:bg-secondary/95 text-white shadow-lg hover:shadow-secondary/40"
                                                    startContent={<Eye size={18} />}
                                                >
                                                    Ver Prévia
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleOpenCheckout(Let_answerSheet)
                                                        }}
                                                        variant="shadow" 
                                                        color="success" 
                                                        startContent={<ShoppingCart size={18} />}
                                                        isLoading={isBuying}
                                                        className="h-12 font-semibold text-[15px] tracking-wide flex-1 bg-success hover:bg-success-600 active:bg-success-700 text-white shadow-lg hover:shadow-success/40"
                                                    >
                                                        {isBuying ? 'Desbloqueando...' : 'Desbloquear'}
                                                    </Button>
                                                </div>
                                            </>
                                        )
                                    ) : (
                                        <Button 
                                            disabled 
                                            variant="flat" 
                                            color="default" 
                                            className="h-12 font-medium text-[15px] tracking-wide bg-default-100"
                                            startContent={<Lock size={18} />}
                                        >
                                            Prova Indisponível
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    {/* <div id="sincronizacaoBox" className="w-full max-w-[900px] mx-auto bg-default-50/80 rounded-xl p-6 border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
                                <div className="flex flex-col gap-2 text-center md:text-left flex-1">
                                    <h2 className="flex items-center gap-2 text-xl font-semibold text-default-700">
                                        <RefreshCw size={20} className="text-primary" />
                                        Sincronização
                                    </h2>
                                    <p className="text-default-500 text-[15px] leading-relaxed">
                                        Use essa opção quando você mudar a data, horário ou local da prova. Provas desbloqueadas vão ser atualizadas sem custo extra.
                                    </p>
                                </div>
                                <Button
                                    color="primary"
                                    variant="ghost"
                                    size="lg"
                                    onClick={updateDataLibrary}
                                    isLoading={isUpdating}
                                    className={`md:w-auto w-full min-w-[160px] h-[48px] text-[15px] font-medium shadow-sm ${isUpdating ? 'hidden' : ''}`}
                                    startContent={!isUpdating && <RefreshCw size={18} className="mr-1" />}
                                >
                                    Sincronizar
                                </Button>
                                {isUpdating && (
                                    <div className="w-full md:w-[300px] flex flex-col gap-2">
                                        <div className="flex justify-between text-xs text-default-500">
                                            <span>{syncMessage}</span>
                                            <span>{Math.floor(syncProgress)}%</span>
                                        </div>
                                        <Progress 
                                            size="md" 
                                            value={syncProgress} 
                                            classNames={{
                                                indicator: "bg-gradient-to-r from-primary-400 to-primary-600"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {isDataLibrary?.createdAt && (
                                <div className="flex items-start gap-2 text-default-400 text-sm">
                                    <Clock size={14} className="text-default-400 mt-[3px]" />
                                    <span>
                                        Última sincronização <span className="font-semibold text-black/50">
                                            {formatDistanceToNow(new Date(isDataLibrary.createdAt), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </span>
                                        {intervalData?.startInterval && intervalData?.endInterval && (
                                            <span className="block text-xs text-default-400">
                                                Período de busca {intervalData.startInterval} até {intervalData.endInterval}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div> */}
                </div>
            )}
        </>
    )
}
