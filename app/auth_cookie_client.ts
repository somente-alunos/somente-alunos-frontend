const Const_logoutEndpointPath = "/post/student-or-admin/sair"

// Os cookies de sessao sao HttpOnly, entao document.cookie nao consegue apaga-los:
// quem os criou (o backend) precisa reenvia-los expirados via Set-Cookie.
export async function Function_clearAuthCookieOnServer(): Promise<void> {
	try {
		await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}${Const_logoutEndpointPath}`, {
			method: "POST",
			credentials: "include"
		})
	}
	catch {
		// Sem acao: falha de rede nao pode travar o logout nem o redirect.
	}
}
