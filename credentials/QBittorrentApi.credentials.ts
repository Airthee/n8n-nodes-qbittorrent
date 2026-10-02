import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import {
	instanciateQBittorrentClient,
	isApiKeyAuthentication,
} from '../helpers/qbittorrent-client-instanciate';

export const QBittorrentApiName = 'qBittorrentApi';

export type QBittorrentApiCredentials = {
	url: string;
	/** Missing on credentials saved before API key authentication was added. */
	authentication?: 'usernamePassword' | 'apiKey';
	username: string;
	password: string;
	apiKey: string;
	cookie: string;
};

export class QBittorrentApi implements ICredentialType {
	name = QBittorrentApiName;

	displayName = 'qBittorrent API';

	icon = 'file:qbittorrentApi.svg' as const;

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
			displayName: 'Authentication',
			name: 'authentication',
			type: 'options',
			options: [
				{
					name: 'API Key',
					value: 'apiKey',
					description: 'Requires qBittorrent 5.2.0 or newer',
				},
				{
					name: 'Username / Password',
					value: 'usernamePassword',
				},
			],
			default: 'usernamePassword',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authentication: ['usernamePassword'],
				},
			},
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authentication: ['usernamePassword'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			hint: 'Generated in qBittorrent under Preferences → WebUI → API Key',
			displayOptions: {
				show: {
					authentication: ['apiKey'],
				},
			},
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

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const authHeader = isApiKeyAuthentication(credentials as QBittorrentApiCredentials)
			? { Authorization: `Bearer ${credentials.apiKey}` }
			: { Cookie: credentials.cookie as string };

		return {
			...requestOptions,
			headers: { ...requestOptions.headers, ...authHeader },
		};
	}

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		// An API key is stateless: there is no session cookie to fetch
		if (isApiKeyAuthentication(credentials as QBittorrentApiCredentials)) {
			return {};
		}

		const client = instanciateQBittorrentClient(
			{ request: this.helpers.httpRequest },
			credentials as QBittorrentApiCredentials,
		);

		const cookie = await client.fetchCookie();
		return { cookie };
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.url}}',
			url: '/api/v2/app/version',
			skipSslCertificateValidation: true,
		},
	};
}
