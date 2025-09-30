import { INodeProperties } from 'n8n-workflow';

export const operations = [
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
				value: 'getAppVersion',
				action: 'Get API version',
			},
		],
		default: 'getAppVersion',
	},
] satisfies INodeProperties[];
