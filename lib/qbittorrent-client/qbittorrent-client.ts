import { IRequestHelper, RequestOptions } from './interfaces/request-helper.interface';
import { filterEmptyValues } from './utils/object';

export type AddTorrentOptions = {
	urls: string;
	savepath?: string;
	cookie?: string;
	category?: string;
	tags?: string;
	skip_checking?: boolean;
	paused?: boolean;
	root_folder?: string;
	rename?: string;
	upLimit?: number;
	dlLimit?: number;
	ratioLimit?: number;
	seedingTimeLimit?: number;
	autoTMM?: boolean;
	sequentialDownload?: boolean;
	firstLastPiecePrio?: boolean;
};

export type QBittorrentClientConstructorOptions = {
	baseURL: string;
	auth?: {
		username: string;
		password: string;
	};
	requestHelper: IRequestHelper;
};

export class QBittorrentClient {
	private cookie: string | null = null;

	constructor(private readonly options: QBittorrentClientConstructorOptions) {}

	public async fetchCookie() {
		const requestConfig: RequestOptions = {
			method: 'POST',
			headers: {
				Referer: this.options.baseURL,
			},
			baseURL: this.options.baseURL,
			url: '/api/v2/auth/login',
			body: new URLSearchParams({
				username: this.options.auth?.username as string,
				password: this.options.auth?.password as string,
			}),
		};

		const resp = await this.doRequest(requestConfig, false);
		const setCookie = resp.headers['set-cookie'];
		const cookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;

		return cookie;
	}

	private async buildHeaders(additionalHeaders: Record<string, any>) {
		const headers = {
			...additionalHeaders,
		};

		// If we have a valid cookie, add it to the headers
		if (this.cookie && this.cookie !== 'session-active') {
			headers.cookie = this.cookie;
		}

		// If we don't have a cookie and authentication is required
		if (this.options.auth && this.cookie === null) {
			const cookie = await this.fetchCookie();
			headers.cookie = cookie;
		}

		return headers;
	}

	private async doRequest(
		request: Omit<RequestOptions, 'returnFullResponse'>,
		refreshCookieIfForbidden: boolean = true,
	) {
		const requestWithFullResponse = {
			...request,
			returnFullResponse: true,
		};
		const unsafeDoRequest = () => this.options.requestHelper.request(requestWithFullResponse);

		try {
			return await unsafeDoRequest();
		} catch (e: any) {
			// If the response is "Forbidden", it means that the session has expired
			if (
				e === 'Forbidden' ||
				(typeof e === 'object' && e.status === 403 && refreshCookieIfForbidden)
			) {
				this.cookie = await this.fetchCookie();
				return await unsafeDoRequest();
			}
			throw e;
		}
	}

	public async getAppVersion() {
		const requestOptions: RequestOptions = {
			method: 'GET',
			baseURL: this.options.baseURL,
			url: '/api/v2/app/version',
			headers: await this.buildHeaders({}),
		};

		return await this.doRequest(requestOptions);
	}

	public async addTorrent(options: AddTorrentOptions) {
		const getBooleanValue = (value?: boolean) => {
			if (value !== undefined) {
				return value ? 'true' : 'false';
			}
			return value;
		};

		const body = {
			urls: options.urls,
			...filterEmptyValues({
				savepath: options.savepath,
				cookie: options.cookie,
				category: options.category,
				tags: options.tags,
				skip_checking: getBooleanValue(options.skip_checking),
				paused: getBooleanValue(options.paused),
				root_folder: options.root_folder,
				rename: options.rename,
				upLimit: options.upLimit?.toString(),
				dlLimit: options.dlLimit?.toString(),
				ratioLimit: options.ratioLimit?.toString(),
				seedingTimeLimit: options.seedingTimeLimit?.toString(),
				autoTMM: getBooleanValue(options.autoTMM),
				sequentialDownload: getBooleanValue(options.sequentialDownload),
				firstLastPiecePrio: getBooleanValue(options.firstLastPiecePrio),
			}),
		};

		const requestOptions: RequestOptions = {
			method: 'POST',
			baseURL: this.options.baseURL,
			url: '/api/v2/torrents/add',
			headers: await this.buildHeaders({
				'content-type': 'multipart/form-data',
			}),
			body,
		};

		return await this.doRequest(requestOptions);
	}
}
