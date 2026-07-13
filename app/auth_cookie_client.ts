const Const_studentLogoutEndpointPath = "/post/student/sair"
const Const_adminLogoutEndpointPath = "/post/admin/sair"

// Os cookies de sessao sao HttpOnly, entao document.cookie nao consegue apaga-los: quem os criou
// (o backend) precisa reenvia-los expirados via Set-Cookie. Cada perfil tem seu proprio endpoint
// porque sair de uma conta de aluno nao pode derrubar a sessao de admin do mesmo navegador.
async function Function_clearAuthCookieOnServer(Parameter_endpointPath: string): Promise<void> {
	try {
		await fetch(`${process.env.NEXT_PUBLIC_Env_urlApiBackend}${Parameter_endpointPath}`, {
			method: "POST",
			credentials: "include"
		})
	}
	catch {
		// Sem acao: falha de rede nao pode travar o logout nem o redirect.
	}
}

export async function Function_clearStudentAuthCookieOnServer(): Promise<void> {
	await Function_clearAuthCookieOnServer(Const_studentLogoutEndpointPath)
}

export async function Function_clearAdminAuthCookieOnServer(): Promise<void> {
	await Function_clearAuthCookieOnServer(Const_adminLogoutEndpointPath)
}
