import { QBittorrentApiCredentials } from '../credentials/QBittorrentApi.credentials';
import {
	QBittorrentClient,
	QBittorrentClientConstructorOptions,
} from '../lib/qbittorrent-client/qbittorrent-client';
import { IRequestHelper } from '../lib/qbittorrent-client/interfaces/request-helper.interface';

export function isApiKeyAuthentication(credentials: QBittorrentApiCredentials) {
	// Credentials saved before the option existed have no `authentication` field
	return credentials.authentication === 'apiKey';
}

/** The API key as pasted by the user, without surrounding whitespace. */
export function getApiKey(credentials: QBittorrentApiCredentials) {
	return (credentials.apiKey ?? '').trim();
}

export function getQBittorrentClientOptions(
	requestHelper: IRequestHelper,
	credentials: QBittorrentApiCredentials,
): QBittorrentClientConstructorOptions {
	const base = { baseURL: credentials.url, requestHelper };

	if (isApiKeyAuthentication(credentials)) {
		return { ...base, apiKey: getApiKey(credentials) };
	}

	return {
		...base,
		auth: {
			username: credentials.username ?? '',
			password: credentials.password ?? '',
		},
	};
}

export function instanciateQBittorrentClient(
	requestHelper: IRequestHelper,
	credentials: QBittorrentApiCredentials,
) {
	return new QBittorrentClient(getQBittorrentClientOptions(requestHelper, credentials));
}
