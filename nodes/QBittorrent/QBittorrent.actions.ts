import { IExecuteFunctions } from 'n8n-workflow';
import {
	AddTorrentOptions,
	QBittorrentClient,
} from '../../lib/qbittorrent-client/qbittorrent-client';

export class QBittorrentActions {
	static instance: QBittorrentActions;
}

export async function addTorrent(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const options: AddTorrentOptions = {
		urls: executeContext.getNodeParameter('urls', itemIndex) as string,
		...(executeContext.getNodeParameter('additionalParameters', itemIndex, {}) as Omit<
			AddTorrentOptions,
			'urls'
		>),
	};

	return client.addTorrent(options);
}
