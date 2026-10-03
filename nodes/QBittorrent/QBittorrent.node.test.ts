import { beforeEach, describe, expect, it } from 'vitest';
import { QBittorrent } from './QBittorrent.node';
import { MockHttpHelper } from '../../lib/qbittorrent-client/__tests__/utils/mock-http-helper';

const BASE_URL = 'http://qbittorrent.local';

describe('QBittorrent.getClientInstance', () => {
	const requestHelper = new MockHttpHelper();

	beforeEach(() => {
		QBittorrent.client = undefined;
	});

	it('should reuse the instance for the same API key', async () => {
		const first = await QBittorrent.getClientInstance({
			baseURL: BASE_URL,
			requestHelper,
			apiKey: 'qbt_first',
		});
		const second = await QBittorrent.getClientInstance({
			baseURL: BASE_URL,
			requestHelper,
			apiKey: 'qbt_first',
		});

		expect(second).toBe(first);
	});

	it('should swap the instance when the API key is rotated', async () => {
		const first = await QBittorrent.getClientInstance({
			baseURL: BASE_URL,
			requestHelper,
			apiKey: 'qbt_first',
		});
		const second = await QBittorrent.getClientInstance({
			baseURL: BASE_URL,
			requestHelper,
			apiKey: 'qbt_second',
		});

		expect(second).not.toBe(first);
	});
});
