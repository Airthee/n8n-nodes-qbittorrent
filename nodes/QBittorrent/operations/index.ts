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
				name: 'Add Tags',
				value: 'addTorrentTags',
				action: 'Add tags to torrents',
			},
			{
				name: 'Add Torrent',
				value: 'addTorrent',
				action: 'Add a torrent to the list',
			},
			{
				name: 'Create Category',
				value: 'createCategory',
				action: 'Create a category',
			},
			{
				name: 'Create Tags',
				value: 'createTags',
				action: 'Create tags',
			},
			{
				name: 'Delete',
				value: 'deleteTorrents',
				action: 'Delete torrents',
			},
			{
				name: 'Get Categories',
				value: 'getCategories',
				action: 'Get all categories',
			},
			{
				name: 'Get Files',
				value: 'getTorrentFiles',
				action: 'Get the files of a torrent',
			},
			{
				name: 'Get Properties',
				value: 'getTorrentProperties',
				action: 'Get the properties of a torrent',
			},
			{
				name: 'Get Tags',
				value: 'getTags',
				action: 'Get all tags',
			},
			{
				name: 'Get Torrents',
				value: 'getTorrentsList',
				action: 'Get torrents list',
			},
			{
				name: 'Get Trackers',
				value: 'getTorrentTrackers',
				action: 'Get the trackers of a torrent',
			},
			{
				name: 'Pause',
				value: 'pauseTorrents',
				action: 'Pause torrents',
			},
			{
				name: 'Reannounce',
				value: 'reannounceTorrents',
				action: 'Reannounce torrents to their trackers',
			},
			{
				name: 'Recheck',
				value: 'recheckTorrents',
				action: 'Recheck torrents',
			},
			{
				name: 'Remove Tags',
				value: 'removeTorrentTags',
				action: 'Remove tags from torrents',
			},
			{
				name: 'Rename',
				value: 'renameTorrent',
				action: 'Rename a torrent',
			},
			{
				name: 'Resume',
				value: 'resumeTorrents',
				action: 'Resume torrents',
			},
			{
				name: 'Set Category',
				value: 'setTorrentCategory',
				action: 'Set the category of torrents',
			},
			{
				name: 'Set Location',
				value: 'setTorrentLocation',
				action: 'Set the location of torrents',
			},
		],
		default: 'getTorrentsList',
	},
	// ----------------------------------
	//         operation:transfers
	// ----------------------------------
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transfers'],
			},
		},
		options: [
			{
				name: 'Get Global Transfer Info',
				value: 'getGlobalTransferInfo',
				action: 'Get the global transfer info',
			},
			{
				name: 'Get Speed Limits Mode',
				value: 'getSpeedLimitsMode',
				action: 'Get the alternative speed limits state',
			},
			{
				name: 'Toggle Speed Limits Mode',
				value: 'toggleSpeedLimitsMode',
				action: 'Toggle the alternative speed limits',
			},
		],
		default: 'getGlobalTransferInfo',
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
			{
				name: 'Get Build Info',
				value: 'getBuildInfo',
				action: 'Get build info',
			},
			{
				name: 'Get Preferences',
				value: 'getPreferences',
				action: 'Get application preferences',
			},
		],
		default: 'getAppVersion',
	},
] satisfies INodeProperties[];
