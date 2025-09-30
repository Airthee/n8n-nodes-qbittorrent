import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';
import { instanciateQBittorrentClient } from '../helpers/qbittorrent-client-instanciate';

export const QBittorrentApiName = 'qBittorrentApi';

export type QBittorrentApiCredentials = {
	url: string;
	username: string;
	password: string;
	cookie: string;
};

export class QBittorrentApi implements ICredentialType {
	name = QBittorrentApiName;

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
			headers: {
				Cookie: '={{$credentials.cookie}}',
			},
		},
	};
}
