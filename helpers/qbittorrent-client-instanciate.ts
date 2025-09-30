import { QBittorrentApiCredentials } from '../credentials/QBittorrentApi.credentials';
import { QBittorrentClient } from '../lib/qbittorrent-client/qbittorrent-client';
import { IRequestHelper } from '../lib/qbittorrent-client/interfaces/request-helper.interface';

export function instanciateQBittorrentClient(
	requestHelper: IRequestHelper,
	credentials: QBittorrentApiCredentials,
) {
	return new QBittorrentClient({
		baseURL: credentials.url as string,
		requestHelper,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
}
