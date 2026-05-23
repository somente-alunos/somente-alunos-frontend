import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	// Parse incoming URL and query string
	const url = new URL(request.url)
	const jwtInf = url.searchParams.get('jwtInf')

	if (!jwtInf) {
		return new Response('Missing jwtInf query parameter', { status: 400 })
	}

	// Build target URL (forward the jwtInf param)
	const targetUrl = `${process.env.NEXT_PUBLIC_Env_urlApiBackend}/answer-sheet?jwtInf=${encodeURIComponent(jwtInf)}`

	// Forward cookies from the incoming request to the target
	const cookieHeader = request.headers.get('cookie') || ''

	// Forward a small set of headers (cookie, user-agent, accept) so the upstream can behave similarly
	const forwardedHeaders: Record<string, string> = {}
	if (cookieHeader) forwardedHeaders['cookie'] = cookieHeader
	const ua = request.headers.get('user-agent')
	if (ua) forwardedHeaders['user-agent'] = ua
	const accept = request.headers.get('accept')
	if (accept) forwardedHeaders['accept'] = accept

	// Perform the fetch to the internal API
	const upstreamResponse = await fetch(targetUrl, {
		method: 'GET',
		headers: forwardedHeaders,
	})

	// Read body as ArrayBuffer so we can relay binary or text bodies unchanged
	const body = await upstreamResponse.arrayBuffer()

	// Prepare response headers (at minimum, forward content-type). Avoid copying all headers which may be restricted.
	const contentType = upstreamResponse.headers.get('content-type') || 'application/octet-stream'
	const responseHeaders = new Headers()
	responseHeaders.set('content-type', contentType)

	// If upstream set a Set-Cookie header, forward it (note: some runtimes restrict setting Set-Cookie)
	const setCookie = upstreamResponse.headers.get('set-cookie')
	if (setCookie) responseHeaders.set('set-cookie', setCookie)

	return new Response(body, { status: upstreamResponse.status, headers: responseHeaders })
}
