import { describe, expect, it, vi } from 'vitest';
import { IHttpRequestHelper, IHttpRequestOptions } from 'n8n-workflow';
import { QBittorrentApi } from './QBittorrentApi.credentials';

const BASE_URL = 'http://qbittorrent.local';
const API_KEY = 'qbt_0123456789abcdef0123456789ab';

const passwordCredentials = {
	url: BASE_URL,
	username: 'admin',
	password: 'secret',
	cookie: 'SID=abc',
};

const apiKeyCredentials = {
	url: BASE_URL,
	authentication: 'apiKey',
	apiKey: API_KEY,
	cookie: '',
};

function getRequestHelper() {
	const httpRequest = vi.fn().mockResolvedValue({ headers: { 'set-cookie': 'SID=abc' }, body: {} });
	return { helpers: { httpRequest } } as unknown as IHttpRequestHelper & {
		helpers: { httpRequest: typeof httpRequest };
	};
}

async function authenticate(credentials: Record<string, string>) {
	const { authenticate } = new QBittorrentApi();
	if (typeof authenticate !== 'function') {
		throw new Error('authenticate is expected to be a function');
	}
	const requestOptions: IHttpRequestOptions = { url: '/api/v2/app/version', headers: {} };
	return authenticate(credentials, requestOptions);
}

describe('QBittorrentApi credentials', () => {
	describe('authenticate', () => {
		it('should send the session cookie by default', async () => {
			const options = await authenticate(passwordCredentials);

			expect(options.headers).toEqual({ Cookie: 'SID=abc' });
		});

		it('should send the API key as a Bearer token in API key mode', async () => {
			const options = await authenticate(apiKeyCredentials);

			expect(options.headers).toEqual({ Authorization: `Bearer ${API_KEY}` });
		});

		it('should trim the API key', async () => {
			const options = await authenticate({ ...apiKeyCredentials, apiKey: ` ${API_KEY}\n` });

			expect(options.headers).toEqual({ Authorization: `Bearer ${API_KEY}` });
		});

		it('should fail clearly when the API key is blank', async () => {
			await expect(authenticate({ ...apiKeyCredentials, apiKey: '' })).rejects.toThrow('API key');
		});
	});

	describe('preAuthentication', () => {
		it('should log in to fetch a cookie by default', async () => {
			const requestHelper = getRequestHelper();

			const result = await new QBittorrentApi().preAuthentication.call(
				requestHelper,
				passwordCredentials,
			);

			expect(result).toEqual({ cookie: 'SID=abc' });
			expect(requestHelper.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({ url: '/api/v2/auth/login' }),
			);
		});

		it('should not log in in API key mode', async () => {
			const requestHelper = getRequestHelper();

			const result = await new QBittorrentApi().preAuthentication.call(
				requestHelper,
				apiKeyCredentials,
			);

			expect(result).toEqual({});
			expect(requestHelper.helpers.httpRequest).not.toHaveBeenCalled();
		});
	});
});
