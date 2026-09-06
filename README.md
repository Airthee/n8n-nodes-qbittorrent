# n8n-nodes-qbittorrent

This is an n8n community node. It lets you use qBittorrent in your n8n workflows.

qBittorrent is a software allowing you to download and upload torrents.  
It also has a web server that can be controlled by a Rest API or an integrated web UI.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Development](#development)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation-and-management/) in the n8n community nodes documentation.

In short, from your n8n instance: **Settings → Community nodes → Install**, then enter `n8n-nodes-qbittorrent`.

## Operations

### Torrent

| Operation              | Description                           |
| ---------------------- | ------------------------------------- |
| `getTorrentsList`      | Get torrents list                     |
| `addTorrent`           | Add a torrent to the list             |
| `stopTorrents`         | Stop torrents                         |
| `startTorrents`        | Start torrents                        |
| `deleteTorrents`       | Delete torrents (optionally files)    |
| `recheckTorrents`      | Recheck torrents                      |
| `reannounceTorrents`   | Reannounce torrents to their trackers |
| `setTorrentCategory`   | Set the category of torrents          |
| `addTorrentTags`       | Add tags to torrents                  |
| `removeTorrentTags`    | Remove tags from torrents             |
| `setTorrentLocation`   | Set the location of torrents          |
| `renameTorrent`        | Rename a torrent                      |
| `getTorrentProperties` | Get the properties of a torrent       |
| `getTorrentFiles`      | Get the files of a torrent            |
| `getTorrentTrackers`   | Get the trackers of a torrent         |
| `getCategories`        | Get all categories                    |
| `createCategory`       | Create a category                     |
| `getTags`              | Get all tags                          |
| `createTags`           | Create tags                           |

### Transfer

| Operation               | Description                            |
| ----------------------- | -------------------------------------- |
| `getGlobalTransferInfo` | Get the global transfer info           |
| `getSpeedLimitsMode`    | Get the alternative speed limits state |
| `toggleSpeedLimitsMode` | Toggle the alternative speed limits    |

### Application

| Operation        | Description                 |
| ---------------- | --------------------------- |
| `getAppVersion`  | Get API version             |
| `getBuildInfo`   | Get build info              |
| `getPreferences` | Get application preferences |

Operations acting on several torrents take a **Torrent Hashes** parameter: a pipe-separated
list of hashes (`hash1|hash2`), or `all` to target every torrent.

## Credentials

Before using a node, you have to add a credential.  
This credential should be your server address and the username / password that have access to the web UI.

Make sure you don't include a slash at the end of the URL, otherwise you may encounter 404 errors when performing various operations.

The node logs in once and reuses the session cookie, refreshing it automatically when the session expires.

## Compatibility

This node targets the **qBittorrent WebUI API v2**, and requires **qBittorrent 5.0+**.

qBittorrent 5.0 renamed several torrent-control routes and parameters. This node uses the 5.x names exclusively, with no version detection and no fallback:

| 4.x                          | 5.x — used by this node |
| ---------------------------- | ----------------------- |
| `torrents/pause`             | `torrents/stop`         |
| `torrents/resume`            | `torrents/start`        |
| `paused` (torrents/add)      | `stopped`               |
| `root_folder` (torrents/add) | `contentLayout`         |

**qBittorrent 4.x is not supported**: the routes above do not exist on 4.x, and the corresponding operations will fail against a 4.x server.

Note that the qBittorrent 5.0 wiki still documents `paused` and `root_folder` for `torrents/add`, but the 5.x source reads only `stopped` and `contentLayout` — the old names are accepted by the request and then silently ignored.

To avoid breakage, **keep your qBittorrent instance up to date** (5.0+ required).

## Development

Build the node and register it globally with npm:

```bash
cd <n8n_node_directory>
npm run build
npm link
```

Link it into the n8n custom nodes directory (`~/.n8n/custom`, create it first if it doesn't exist):

```bash
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm init -y   # only the first time
npm link n8n-nodes-qbittorrent
```

Run your `n8n` instance:

```bash
npx n8n
```

The node appears in the editor under its display name, **qBittorrent**.

After updating the code, run `npm run build` from the node directory and restart your n8n instance.
See the [Run your node locally](https://docs.n8n.io/connect/create-nodes/test-your-node/run-your-node-locally/) guide for details.

Other useful scripts:

```bash
npm run dev     # tsc --watch
npm test        # vitest
npm run lint    # eslint
npm run format  # prettier
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [qBittorrent WebUI API (v2) documentation](<https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-5.0)>)

## Version history

Current version supports the [version 2 of the qBittorrent API](<https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-5.0)>).  
If a new qBittorrent API version is released, a new major version of this node will be released.
