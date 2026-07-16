import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QBittorrentClient } from './qbittorrent-client';
import { MockHttpHelper } from './__tests__/utils/mock-http-helper';

const BASE_URL = 'http://qbittorrent.local';
const USERNAME = 'admin';
const PASSWORD = 'secret';

describe('qbittorrent-client', () => {
	let requestHelper: MockHttpHelper;
	beforeEach(() => {
		requestHelper = new MockHttpHelper();
	});

	function getClient() {
		return new QBittorrentClient({ baseURL: BASE_URL, requestHelper });
	}

	function getClientWithAuth() {
		return new QBittorrentClient({
			baseURL: BASE_URL,
			requestHelper,
			auth: {
				username: USERNAME,
				password: PASSWORD,
			},
		});
	}

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('addTorrent', () => {
		it('should make a POST on /torrents/add', async () => {
			const client = getClient();
			await client.addTorrent({
				urls: 'http://example.com/torrent.torrent',
			});

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'POST',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/add',
				body: {
					urls: 'http://example.com/torrent.torrent',
				},
				headers: {
					'content-type': 'multipart/form-data',
				},
				returnFullResponse: true,
			});
		});

		it('should login for the first request', async () => {
			const client = getClientWithAuth();
			await client.addTorrent({
				urls: 'http://example.com/torrent.torrent',
			});

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'POST',
				headers: {
					Referer: BASE_URL,
				},
				baseURL: BASE_URL,
				url: `/api/v2/auth/login`,
				body: new URLSearchParams({
					username: USERNAME,
					password: PASSWORD,
				}),
				returnFullResponse: true,
			});
		});

		it('should send cookie to the request', async () => {
			requestHelper.request.mockImplementation(async (options) => {
				if (options.url === '/api/v2/auth/login') {
					return { headers: { 'set-cookie': 'testCookie' }, body: {}, status: 200 };
				}
				return { body: { message: 'ok' }, headers: {}, status: 200 };
			});

			const client = getClientWithAuth();
			await client.addTorrent({
				urls: 'http://example.com/torrent.torrent',
			});

			expect(requestHelper.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						cookie: 'testCookie',
					}),
				}),
			);
		});
	});

	describe('torrent control', () => {
		it('should POST /torrents/pause with the hashes', async () => {
			await getClient().pauseTorrents('hash1|hash2');

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'POST',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/pause',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ hashes: 'hash1|hash2' }),
				returnFullResponse: true,
			});
		});

		it('should POST /torrents/delete with deleteFiles', async () => {
			await getClient().deleteTorrents('hash1', true);

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'POST',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/delete',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ hashes: 'hash1', deleteFiles: 'true' }),
				returnFullResponse: true,
			});
		});
	});

	describe('organization', () => {
		it('should POST /torrents/setCategory with hashes and category', async () => {
			await getClient().setTorrentCategory('hash1', 'movies');

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'POST',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/setCategory',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ hashes: 'hash1', category: 'movies' }),
				returnFullResponse: true,
			});
		});
	});

	describe('details', () => {
		it('should GET /torrents/properties with the hash as query', async () => {
			await getClient().getTorrentProperties('abc123');

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'GET',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/properties?hash=abc123',
				headers: {},
				returnFullResponse: true,
			});
		});
	});

	describe('categories & tags', () => {
		it('should GET /torrents/categories', async () => {
			await getClient().getCategories();

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'GET',
				baseURL: BASE_URL,
				url: '/api/v2/torrents/categories',
				headers: {},
				returnFullResponse: true,
			});
		});
	});

	describe('transfer', () => {
		it('should GET /transfer/info', async () => {
			await getClient().getGlobalTransferInfo();

			expect(requestHelper.request).toHaveBeenCalledWith({
				method: 'GET',
				baseURL: BASE_URL,
				url: '/api/v2/transfer/info',
				headers: {},
				returnFullResponse: true,
			});
		});
	});
});
