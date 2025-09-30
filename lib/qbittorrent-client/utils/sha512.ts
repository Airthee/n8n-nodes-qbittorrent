export async function sha512(content: string) {
	const hash = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(content));
	const hashArray = Array.from(new Uint8Array(hash));
	return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
