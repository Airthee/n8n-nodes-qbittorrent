import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QBittorrentClient } from './qbittorrent-client';
import { MockHttpHelper } from './__tests__/utils/mock-http-helper';

const BASE_URL = 'http://qbittorrent.local/api/v2';
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
				url: '/torrents/add',
				body: {
					urls: 'http://example.com/torrent.torrent',
				},
				headers: {
					'content-type': 'multipart/form-data',
				},
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
				url: `/auth/login`,
				body: new URLSearchParams({
					username: USERNAME,
					password: PASSWORD,
				}),
			});
		});

		it('should send cookie to the request', async () => {
			requestHelper.request.mockImplementation(async (options) => {
				if (options.url === '/auth/login') {
					return { headers: { 'set-cookie': 'testCookie' } };
				}
				return { body: { message: 'ok' } };
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
});
