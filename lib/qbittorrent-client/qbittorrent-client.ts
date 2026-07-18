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

	private apiMajorVersion?: number;

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

	public async getTorrentsList() {
		const requestOptions: RequestOptions = {
			method: 'GET',
			baseURL: this.options.baseURL,
			url: '/api/v2/torrents/info',
			headers: await this.buildHeaders({}),
		};

		return await this.doRequest(requestOptions);
	}

	// ----------------------------------------------------------------
	//  Generic helpers
	// ----------------------------------------------------------------

	private buildForm(params: Record<string, string | undefined>): URLSearchParams {
		const form = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				form.append(key, value);
			}
		}
		return form;
	}

	/** GET request, with an optional query string. */
	private async getJson(url: string, query?: Record<string, string>) {
		const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
		const requestOptions: RequestOptions = {
			method: 'GET',
			baseURL: this.options.baseURL,
			url: `${url}${queryString}`,
			headers: await this.buildHeaders({}),
		};

		return await this.doRequest(requestOptions);
	}

	/** POST request with an application/x-www-form-urlencoded body. */
	private async postForm(url: string, params: Record<string, string | undefined>) {
		const requestOptions: RequestOptions = {
			method: 'POST',
			baseURL: this.options.baseURL,
			url,
			headers: await this.buildHeaders({
				'content-type': 'application/x-www-form-urlencoded',
			}),
			body: this.buildForm(params),
		};

		return await this.doRequest(requestOptions);
	}

	/**
	 * Detect the qBittorrent major version (cached for the client's lifetime).
	 * qBittorrent 5.0 renamed several torrent-control routes, so callers can
	 * pick the right endpoint. Falls back to 5 (modern routes) if the version
	 * string can't be read.
	 */
	private async isApiV5OrNewer(): Promise<boolean> {
		if (this.apiMajorVersion === undefined) {
			try {
				const res = await this.getAppVersion();
				const raw = typeof res === 'string' ? res : (res?.body ?? '');
				const match = String(raw).match(/(\d+)/);
				this.apiMajorVersion = match ? parseInt(match[1], 10) : 5;
			} catch {
				this.apiMajorVersion = 5;
			}
		}
		return this.apiMajorVersion >= 5;
	}

	// ----------------------------------------------------------------
	//  Torrent control
	// ----------------------------------------------------------------

	public async pauseTorrents(hashes: string) {
		// qBittorrent 5.0 renamed pause → stop; on 4.x the /stop route 404s.
		const action = (await this.isApiV5OrNewer()) ? 'stop' : 'pause';
		return this.postForm(`/api/v2/torrents/${action}`, { hashes });
	}

	public async resumeTorrents(hashes: string) {
		// qBittorrent 5.0 renamed resume → start; on 4.x the /start route 404s.
		const action = (await this.isApiV5OrNewer()) ? 'start' : 'resume';
		return this.postForm(`/api/v2/torrents/${action}`, { hashes });
	}

	public async deleteTorrents(hashes: string, deleteFiles: boolean) {
		return this.postForm('/api/v2/torrents/delete', {
			hashes,
			deleteFiles: deleteFiles ? 'true' : 'false',
		});
	}

	public async recheckTorrents(hashes: string) {
		return this.postForm('/api/v2/torrents/recheck', { hashes });
	}

	public async reannounceTorrents(hashes: string) {
		return this.postForm('/api/v2/torrents/reannounce', { hashes });
	}

	// ----------------------------------------------------------------
	//  Torrent organization
	// ----------------------------------------------------------------

	public async setTorrentCategory(hashes: string, category: string) {
		return this.postForm('/api/v2/torrents/setCategory', { hashes, category });
	}

	public async addTorrentTags(hashes: string, tags: string) {
		return this.postForm('/api/v2/torrents/addTags', { hashes, tags });
	}

	public async removeTorrentTags(hashes: string, tags: string) {
		return this.postForm('/api/v2/torrents/removeTags', { hashes, tags });
	}

	public async setTorrentLocation(hashes: string, location: string) {
		return this.postForm('/api/v2/torrents/setLocation', { hashes, location });
	}

	public async renameTorrent(hash: string, name: string) {
		return this.postForm('/api/v2/torrents/rename', { hash, name });
	}

	// ----------------------------------------------------------------
	//  Torrent details
	// ----------------------------------------------------------------

	public async getTorrentProperties(hash: string) {
		return this.getJson('/api/v2/torrents/properties', { hash });
	}

	public async getTorrentFiles(hash: string) {
		return this.getJson('/api/v2/torrents/files', { hash });
	}

	public async getTorrentTrackers(hash: string) {
		return this.getJson('/api/v2/torrents/trackers', { hash });
	}

	// ----------------------------------------------------------------
	//  Categories & tags
	// ----------------------------------------------------------------

	public async getCategories() {
		return this.getJson('/api/v2/torrents/categories');
	}

	public async createCategory(category: string, savePath: string) {
		return this.postForm('/api/v2/torrents/createCategory', { category, savePath });
	}

	public async getTags() {
		return this.getJson('/api/v2/torrents/tags');
	}

	public async createTags(tags: string) {
		return this.postForm('/api/v2/torrents/createTags', { tags });
	}

	// ----------------------------------------------------------------
	//  Transfer info
	// ----------------------------------------------------------------

	public async getGlobalTransferInfo() {
		return this.getJson('/api/v2/transfer/info');
	}

	public async getSpeedLimitsMode() {
		return this.getJson('/api/v2/transfer/speedLimitsMode');
	}

	public async toggleSpeedLimitsMode() {
		return this.postForm('/api/v2/transfer/toggleSpeedLimitsMode', {});
	}

	// ----------------------------------------------------------------
	//  Application
	// ----------------------------------------------------------------

	public async getBuildInfo() {
		return this.getJson('/api/v2/app/buildInfo');
	}

	public async getPreferences() {
		return this.getJson('/api/v2/app/preferences');
	}
}
