import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeExecutionWithMetadata,
} from 'n8n-workflow';
import { addTorrent } from './QBittorrent.actions';
import {
	QBittorrentApiCredentials,
	QBittorrentApiName,
} from '../../credentials/QBittorrentApi.credentials';
import {
	QBittorrentClient,
	QBittorrentClientConstructorOptions,
} from '../../lib/qbittorrent-client/qbittorrent-client';
import { sha512 } from '../../lib/qbittorrent-client/utils/sha512';

// Documentation
// https://docs.n8n.io/integrations/creating-nodes/overview/
// https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-5.0)

export class QBittorrent implements INodeType {
	static client:
		| {
				identifier: string;
				instance: QBittorrentClient;
		  }
		| undefined;

	description: INodeTypeDescription = {
		displayName: 'qBittorrent',
		name: 'qBittorrent',
		icon: 'file:qbittorrent.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Communicate with your qBittorrent instance web API',
		credentials: [
			{
				name: QBittorrentApiName,
				required: true,
			},
		],
		defaults: {
			name: 'qBittorrent',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		requestDefaults: {
			baseURL: '={{$credentials["url"] + "/api/v2"}}',
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Application',
						value: 'application',
					},
					{
						name: 'Log',
						value: 'logs',
					},
					{
						name: 'Tranfer',
						value: 'transfers',
					},
					{
						name: 'Torrent',
						value: 'torrents',
					},
				],
				default: 'torrents',
			},

			// ----------------------------------
			//         operation:torrents
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['torrents'],
					},
				},
				options: [
					{
						name: 'Get Torrents',
						value: 'getTorrentsList',
						action: 'Get torrents list',
						routing: {
							request: {
								method: 'GET',
								url: '/torrents/info',
								skipSslCertificateValidation: true,
							},
						},
					},
					{
						name: 'Add Torrent',
						value: 'addTorrent',
						action: 'Add a torrent to the list',
					},
				],
				default: 'addTorrent',
			},
			// ----------------------------------
			//         operation:application
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['application'],
					},
				},
				options: [
					{
						name: 'Get API Version',
						value: 'getApiVersion',
						action: 'Get API version',
						routing: {
							request: {
								method: 'GET',
								url: '/app/version',
								skipSslCertificateValidation: true,
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { version: $response.body } }}',
										},
									},
								],
							},
						},
					},
				],
				default: 'getApiVersion',
			},

			// ----------------------------------
			//         fields
			// ----------------------------------
			{
				displayName: 'Torrent URL',
				name: 'urls',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				required: true,
				description: 'URLs separated with newlines',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				type: 'collection',
				placeholder: 'Add an option',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Automatic Torrent Management',
						name: 'autoTMM',
						type: 'boolean',
						default: false,
						description: 'Whether Automatic Torrent Management should be used',
					},
					{
						displayName: 'Category',
						name: 'category',
						type: 'string',
						default: '',
						description: 'Category for the torrent',
					},
					{
						displayName: 'Cookie',
						name: 'cookie',
						type: 'string',
						default: '',
						description: 'Cookie sent to download the .torrent file',
					},
					{
						displayName: 'Create Root Folder',
						name: 'root_folder',
						type: 'string',
						default: '',
						description:
							'Create the root folder. Possible values are "true", "false", unset (default).',
					},
					{
						displayName: 'Download Limit',
						name: 'dlLimit',
						type: 'number',
						default: '',
						description: 'Set torrent download speed limit. Unit in bytes/second.',
					},
					{
						displayName: 'First Last Piece Priority',
						name: 'firstLastPiecePrio',
						type: 'boolean',
						default: false,
						description: 'Whether first last piece should be prioritized',
					},
					{
						displayName: 'Paused',
						name: 'paused',
						type: 'boolean',
						default: false,
						description: 'Whether torrents are added in the paused state',
					},
					{
						displayName: 'Ratio Limit',
						name: 'ratioLimit',
						type: 'number',
						default: '',
						description: 'Set torrent share ratio limit',
					},
					{
						displayName: 'Rename Torrent',
						name: 'rename',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Save Path',
						name: 'savepath',
						type: 'string',
						default: '',
						description: 'Download folder',
					},
					{
						displayName: 'Seeding Time Limit',
						name: 'seedingTimeLimit',
						type: 'number',
						default: '',
						description: 'Set torrent seeding time limit. Unit in minutes.',
					},
					{
						displayName: 'Sequential Download',
						name: 'sequentialDownload',
						type: 'boolean',
						default: false,
						description: 'Whether sequential download is should be enabled',
					},

					{
						displayName: 'Skip Hash Checking',
						name: 'skip_checking',
						type: 'boolean',
						default: false,
						description: 'Whether hash checking is skipped',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Tags for the torrent, split by ","',
					},
					{
						displayName: 'Upload Limit',
						name: 'upLimit',
						type: 'number',
						default: '',
						description: 'Set torrent upload speed limit. Unit in bytes/second.',
					},
				],
			},
		],
	};

	public async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			const credentials = (await this.getCredentials(
				QBittorrentApiName,
				i,
			)) as QBittorrentApiCredentials;
			const client = await QBittorrent.getClientInstance({
				baseURL: credentials.url as string,
				requestHelper: { request: this.helpers.httpRequest },
				auth: {
					username: credentials.username,
					password: credentials.password,
				},
			});

			const action = this.getNodeParameter('operation', i);
			if (action === 'addTorrent') {
				const response = await addTorrent(this, i, client);
				returnData.push({ json: response });
			}
		}

		return this.prepareOutputData(returnData);
	}

	public static async getClientInstance(options: QBittorrentClientConstructorOptions) {
		const clearIdentifier = `${options.baseURL}-${options.auth?.username}-${options.auth?.password}`;
		const hash = await sha512(clearIdentifier);

		if (QBittorrent.client?.identifier !== hash) {
			QBittorrent.client = {
				identifier: hash,
				instance: new QBittorrentClient(options),
			};
		}
		return QBittorrent.client.instance;
	}
}
