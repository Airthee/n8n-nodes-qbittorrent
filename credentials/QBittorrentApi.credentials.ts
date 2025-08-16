import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class QBittorrentApi implements ICredentialType {
	name = 'qBittorrentApi';

	displayName = 'qBittorrent API';

	properties: INodeProperties[] = [
		{
			displayName: 'Url',
			name: 'url',
			type: 'string',
			default: '',
			extractValue: {
				type: 'regex',
				regex: /https?:\/\/.+[^/]/,
			},
			placeholder: 'http://localhost:8080',
			hint: 'The URL of the qBittorrent WebUI. Do not include slash at the end.',
			validateType: 'url',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Cookie',
			name: 'cookie',
			type: 'hidden',
			default: '',
			typeOptions: {
				expirable: true,
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Cookie: '={{$credentials.cookie}}',
			},
		},
	};

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const url = credentials.url as string;
		const requestConfig: IHttpRequestOptions = {
			method: 'POST',
			headers: {
				Referer: credentials.url,
			},
			url: `${url}/api/v2/auth/login`,
			body: new URLSearchParams({
				username: credentials.username as string,
				password: credentials.password as string,
			}),
			returnFullResponse: true,
			skipSslCertificateValidation: true,
		};

		const resp = await this.helpers.httpRequest(requestConfig).catch((e) => {
			console.error(e.response.data);
			throw e;
		});

		return { cookie: resp.headers['set-cookie'] };
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.url}}',
			url: '/api/v2/app/version',
			skipSslCertificateValidation: true,
		},
	};
}
