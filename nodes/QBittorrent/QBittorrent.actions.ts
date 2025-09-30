import { IExecuteFunctions } from 'n8n-workflow';
import {
	AddTorrentOptions,
	QBittorrentClient,
} from '../../lib/qbittorrent-client/qbittorrent-client';

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

export async function getAppVersion(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getAppVersion();
}

export async function getTorrentsList(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getTorrentsList();
}
