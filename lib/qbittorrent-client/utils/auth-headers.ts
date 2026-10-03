export type AuthHeadersSource = { apiKey: string } | { cookie: string };

/**
 * Builds the authentication header for a qBittorrent request.
 *
 * Shared by the client and the n8n credential test so both paths always send the same header.
 */
export function buildAuthHeaders(source: AuthHeadersSource): Record<string, string> {
	if ('apiKey' in source) {
		if (source.apiKey.trim() === '') {
			throw new Error('The qBittorrent API key is empty');
		}
		return { Authorization: `Bearer ${source.apiKey}` };
	}

	return { Cookie: source.cookie };
}
