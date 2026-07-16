import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionType,
	NodeExecutionWithMetadata,
	NodeOperationError,
} from 'n8n-workflow';
import * as actions from './QBittorrent.actions';
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
		icon: { light: 'file:qbittorrent.svg', dark: 'file:qbittorrent.svg' },
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
			try {
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

				const operation = this.getNodeParameter('operation', i) as keyof typeof actions;
				const action = actions[operation];
				if (typeof action !== 'function') {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex: i,
					});
				}
				returnData.push({ json: await action(this, i, client) });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
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
