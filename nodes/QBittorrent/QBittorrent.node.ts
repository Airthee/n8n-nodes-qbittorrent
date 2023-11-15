import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class QBittorrent implements INodeType {
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
				name: 'qBittorrentApi',
				required: true,
			},
		],
		defaults: {
			name: 'qBittorrent'
		},
		inputs: ['main'],
		outputs: ['main'],
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
						}
					},
					{
						name: 'Add Torrent',
						value: 'addTorrent',
						action: 'Add a torrent to the list',
						routing: {
							request: {
								method: 'POST',
								url: '/torrents/add',
								skipSslCertificateValidation: true,
								body: {
									urls: '={{ $parameter["operation"] }}'
								}
							},
						},
					}
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
						},
					}
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
				displayName: 'Save Path',
				name: 'savepath',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Download folder',
			},
			{
				displayName: 'Cookie',
				name: 'cookie',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Cookie sent to download the .torrent file',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Category for the torrent',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Tags for the torrent, split by ","',
			},
			{
				displayName: 'Skip Hash Checking',
				name: 'skip_checking',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Skip hash checking. Possible values are "true", "false" (default).',
			},
			{
				displayName: 'Paused',
				name: 'paused',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Add torrents in the paused state. Possible values are "true", "false" (default).',
			},
			{
				displayName: 'Create Root Folder',
				name: 'root_folder',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Create the root folder. Possible values are "true", "false", unset (default).',
			},
			{
				displayName: 'Rename Torrent',
				name: 'rename',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
			},
			{
				displayName: 'Upload Limit',
				name: 'upLimit',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Set torrent upload speed limit. Unit in bytes/second.',
			},
			{
				displayName: 'Download Limit',
				name: 'dlLimit',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Set torrent download speed limit. Unit in bytes/second.',
			},
			{
				displayName: 'Ratio Limit',
				name: 'ratioLimit',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Set torrent share ratio limit',
			},
			{
				displayName: 'Seeding Time Limit',
				name: 'seedingTimeLimit',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Set torrent seeding time limit. Unit in minutes.',
			},
			{
				displayName: 'Automatic Torrent Management',
				name: 'autoTMM',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Whether Automatic Torrent Management should be used',
			},
			{
				displayName: 'Sequential Download',
				name: 'sequentialDownload',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Enable sequential download. Possible values are "true", "false" (default).',
			},
			{
				displayName: 'First Last Piece Priority',
				name: 'firstLastPiecePrio',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['addTorrent'],
						resource: ['torrents'],
					},
				},
				description: 'Prioritize download first last piece. Possible values are "true", "false" (default).',
			}
		]
	}
}
