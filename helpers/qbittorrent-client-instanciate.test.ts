import { describe, expect, it } from 'vitest';
import { getApiKey, getQBittorrentClientOptions } from './qbittorrent-client-instanciate';
import { MockHttpHelper } from '../lib/qbittorrent-client/__tests__/utils/mock-http-helper';

const BASE_URL = 'http://qbittorrent.local';
const requestHelper = new MockHttpHelper();

describe('getQBittorrentClientOptions', () => {
	it('should use the username and password for credentials saved before the authentication option existed', () => {
		const options = getQBittorrentClientOptions(requestHelper, {
			url: BASE_URL,
			username: 'admin',
			password: 'secret',
			cookie: '',
		});

		expect(options).toEqual({
			baseURL: BASE_URL,
			requestHelper,
			auth: { username: 'admin', password: 'secret' },
		});
	});

	it('should use the API key in API key mode, without username and password', () => {
		const options = getQBittorrentClientOptions(requestHelper, {
			url: BASE_URL,
			authentication: 'apiKey',
			apiKey: 'qbt_abc',
			username: 'admin',
			password: 'secret',
			cookie: '',
		});

		expect(options).toEqual({ baseURL: BASE_URL, requestHelper, apiKey: 'qbt_abc' });
	});

	it('should trim the API key', () => {
		const options = getQBittorrentClientOptions(requestHelper, {
			url: BASE_URL,
			authentication: 'apiKey',
			apiKey: ' qbt_abc\n',
			cookie: '',
		});

		expect(options.apiKey).toBe('qbt_abc');
	});
});

describe('getApiKey', () => {
	it('should return an empty string when the key is missing', () => {
		expect(getApiKey({ url: BASE_URL, cookie: '' })).toBe('');
	});
});
