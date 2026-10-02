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

export function getQBittorrentClientOptions(
	requestHelper: IRequestHelper,
	credentials: QBittorrentApiCredentials,
): QBittorrentClientConstructorOptions {
	if (isApiKeyAuthentication(credentials)) {
		return {
			baseURL: credentials.url as string,
			requestHelper,
			apiKey: credentials.apiKey as string,
		};
	}

	return {
		baseURL: credentials.url as string,
		requestHelper,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	};
}

export function instanciateQBittorrentClient(
	requestHelper: IRequestHelper,
	credentials: QBittorrentApiCredentials,
) {
	return new QBittorrentClient(getQBittorrentClientOptions(requestHelper, credentials));
}
