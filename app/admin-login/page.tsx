'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { Function_clearAuthCookieOnServer } from '@/app/auth_cookie_client'

const Const_adminSessionStorageKey = 'somente_alunos_admin_session_v1'

type Type_adminLoginResponse = {
	admin: {
		admin_uuid: string;
		name_admin: string;
		email_admin: string;
	};
}

async function Function_clearAdminArtifacts(): Promise<void> {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(Const_adminSessionStorageKey)
	}

	await Function_clearAuthCookieOnServer()
}

async function Function_getResponsePayload(Parameter_response: Response): Promise<unknown> {
	const Const_text = await Parameter_response.text()
	if (!Const_text) {
		return null
	}

	try {
		return JSON.parse(Const_text) as unknown
	}
	catch {
		return Const_text
	}
}

export default function Page_AdminLogin(): JSX.Element {
	const Const_router = useRouter()
	const [isEmailAdmin, setEmailAdmin] = useState('')
	const [isPasswordAdmin, setPasswordAdmin] = useState('')
	const [isLoading, setLoading] = useState(false)
	const [isCheckingSession, setCheckingSession] = useState(true)
	const [isError, setError] = useState('')
	const [isLastResponse, setLastResponse] = useState<unknown>(null)

	useEffect(() => {
		let Let_isCancelled = false

		const Function_validateCurrentCookie = async (): Promise<void> => {
			try {
				const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/get/admin/metrica`, {
					method: 'GET',
					credentials: 'include'
				})

				if (!Let_isCancelled && Const_response.ok) {
					Const_router.replace('/admin')
					return
				}
			}
			catch {
				// Sem açao: apenas deixa seguir para tela de login.
			}

			if (!Let_isCancelled) {
				setCheckingSession(false)
			}
		}

		Function_validateCurrentCookie().catch(() => {
			if (!Let_isCancelled) {
				setCheckingSession(false)
			}
		})

		return () => {
			Let_isCancelled = true
		}
	}, [Const_router])

	const Function_handleSubmit = async (Parameter_event: FormEvent<HTMLFormElement>): Promise<void> => {
		Parameter_event.preventDefault()
		setLoading(true)
		setError('')
		setLastResponse(null)

		try {
			const Const_response = await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}/post/admin/entrar`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					emailAdmin: isEmailAdmin.trim(),
					passwordAdmin: isPasswordAdmin
				})
			})

			const Const_payload = await Function_getResponsePayload(Const_response)
			setLastResponse(Const_payload)

			if (!Const_response.ok) {
				setError('Falha no login admin. Confira email/senha e veja o JSON retornado abaixo.')
				setLoading(false)
				return
			}

			const Const_payloadTyped = Const_payload as Partial<Type_adminLoginResponse>
			if (typeof localStorage !== 'undefined' && Const_payloadTyped?.admin?.admin_uuid) {
				localStorage.setItem(Const_adminSessionStorageKey, JSON.stringify({
					admin: Const_payloadTyped.admin,
					loggedAt: new Date().toISOString()
				}))
			}

			Const_router.push('/admin')
		}
		catch (Parameter_error) {
			setError('Erro de rede ao tentar logar como admin.')
			setLastResponse({
				error: String(Parameter_error)
			})
		}
		finally {
			setLoading(false)
		}
	}

	const Function_logoutLocal = async (): Promise<void> => {
		await Function_clearAdminArtifacts()
		setError('')
		setLastResponse({ success: true, message: 'Cookies/sessão limpos pelo servidor.' })
	}

	if (isCheckingSession) {
		return (
			<main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
				<div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
					<p className="text-sm text-slate-300">Verificando sessão admin existente...</p>
				</div>
			</main>
		)
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(38,99,235,.22),transparent_55%),linear-gradient(180deg,#020617,#111827)] text-slate-100 px-6 py-10">
			<div className="mx-auto w-full max-w-3xl">
				<div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-2xl p-6 md:p-8">
					<h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
					<p className="mt-2 text-sm text-slate-300">
						Autenticação via <code>/post/admin/entrar</code> com cookies (<code>credentials: include</code>).
					</p>

					<form className="mt-6 grid gap-4" onSubmit={Function_handleSubmit}>
						<label className="grid gap-1 text-sm">
							<span className="text-slate-200">Email admin</span>
							<input
								type="email"
								required
								value={isEmailAdmin}
								onChange={(Parameter_event) => setEmailAdmin(Parameter_event.target.value)}
								className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
								placeholder="admin@admin.com"
							/>
						</label>

						<label className="grid gap-1 text-sm">
							<span className="text-slate-200">Senha admin</span>
							<input
								type="password"
								required
								value={isPasswordAdmin}
								onChange={(Parameter_event) => setPasswordAdmin(Parameter_event.target.value)}
								className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 outline-none focus:border-sky-400"
								placeholder="Digite a senha"
							/>
						</label>

						<div className="flex flex-wrap gap-3 pt-2">
							<button
								type="submit"
								disabled={isLoading}
								className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
							>
								{isLoading ? 'Entrando...' : 'Entrar como admin'}
							</button>

							<button
								type="button"
								onClick={Function_logoutLocal}
								className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100"
							>
								Limpar sessão/cookies
							</button>

							<Link
								href="/admin"
								className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100"
							>
								Ir para /admin
							</Link>
						</div>
					</form>

					{isError ? (
						<p className="mt-4 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
							{isError}
						</p>
					) : null}

					<div className="mt-6">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Última resposta</p>
						<pre className="mt-2 max-h-[380px] overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200">
							{JSON.stringify(isLastResponse, null, 2)}
						</pre>
					</div>
				</div>
			</div>
		</main>
	)
}

