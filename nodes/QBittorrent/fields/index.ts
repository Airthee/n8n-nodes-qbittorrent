import { INodeProperties } from 'n8n-workflow';

export const fields = [
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
] satisfies INodeProperties[];
