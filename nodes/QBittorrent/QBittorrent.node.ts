import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeExecutionWithMetadata,
} from 'n8n-workflow';
import { addTorrent, getAppVersion, getTorrentsList } from './QBittorrent.actions';
import {
	QBittorrentApiCredentials,
	QBittorrentApiName,
} from '../../credentials/QBittorrentApi.credentials';
import {
	QBittorrentClient,
	QBittorrentClientConstructorOptions,
} from '../../lib/qbittorrent-client/qbittorrent-client';
import { sha512 } from '../../lib/qbittorrent-client/utils/sha512';
import { operations } from './operations';
import { fields } from './fields';

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

			...operations,
			...fields,
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
				returnData.push({ json: await addTorrent(this, i, client) });
			}
			if (action === 'getAppVersion') {
				returnData.push({ json: await getAppVersion(this, i, client) });
			}
			if (action === 'getTorrentsList') {
				returnData.push({ json: await getTorrentsList(this, i, client) });
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
