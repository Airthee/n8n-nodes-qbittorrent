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

// ----------------------------------------------------------------
//  Torrent control
// ----------------------------------------------------------------

export async function pauseTorrents(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	return client.pauseTorrents(hashes);
}

export async function resumeTorrents(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	return client.resumeTorrents(hashes);
}

export async function deleteTorrents(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	const deleteFiles = executeContext.getNodeParameter('deleteFiles', itemIndex) as boolean;
	return client.deleteTorrents(hashes, deleteFiles);
}

export async function recheckTorrents(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	return client.recheckTorrents(hashes);
}

export async function reannounceTorrents(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	return client.reannounceTorrents(hashes);
}

// ----------------------------------------------------------------
//  Torrent organization
// ----------------------------------------------------------------

export async function setTorrentCategory(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	const category = executeContext.getNodeParameter('category', itemIndex) as string;
	return client.setTorrentCategory(hashes, category);
}

export async function addTorrentTags(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	const tags = executeContext.getNodeParameter('tags', itemIndex) as string;
	return client.addTorrentTags(hashes, tags);
}

export async function removeTorrentTags(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	const tags = executeContext.getNodeParameter('tags', itemIndex) as string;
	return client.removeTorrentTags(hashes, tags);
}

export async function setTorrentLocation(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hashes = executeContext.getNodeParameter('hashes', itemIndex) as string;
	const location = executeContext.getNodeParameter('location', itemIndex) as string;
	return client.setTorrentLocation(hashes, location);
}

export async function renameTorrent(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hash = executeContext.getNodeParameter('hash', itemIndex) as string;
	const name = executeContext.getNodeParameter('name', itemIndex) as string;
	return client.renameTorrent(hash, name);
}

// ----------------------------------------------------------------
//  Torrent details
// ----------------------------------------------------------------

export async function getTorrentProperties(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hash = executeContext.getNodeParameter('hash', itemIndex) as string;
	return client.getTorrentProperties(hash);
}

export async function getTorrentFiles(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hash = executeContext.getNodeParameter('hash', itemIndex) as string;
	return client.getTorrentFiles(hash);
}

export async function getTorrentTrackers(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const hash = executeContext.getNodeParameter('hash', itemIndex) as string;
	return client.getTorrentTrackers(hash);
}

// ----------------------------------------------------------------
//  Categories & tags
// ----------------------------------------------------------------

export async function getCategories(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getCategories();
}

export async function createCategory(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const category = executeContext.getNodeParameter('category', itemIndex) as string;
	const savePath = executeContext.getNodeParameter('savePath', itemIndex, '') as string;
	return client.createCategory(category, savePath);
}

export async function getTags(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getTags();
}

export async function createTags(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	const tags = executeContext.getNodeParameter('tags', itemIndex) as string;
	return client.createTags(tags);
}

// ----------------------------------------------------------------
//  Transfer info
// ----------------------------------------------------------------

export async function getGlobalTransferInfo(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getGlobalTransferInfo();
}

export async function getSpeedLimitsMode(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getSpeedLimitsMode();
}

export async function toggleSpeedLimitsMode(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.toggleSpeedLimitsMode();
}

// ----------------------------------------------------------------
//  Application
// ----------------------------------------------------------------

export async function getBuildInfo(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getBuildInfo();
}

export async function getPreferences(
	executeContext: IExecuteFunctions,
	itemIndex: number,
	client: QBittorrentClient,
) {
	return client.getPreferences();
}
