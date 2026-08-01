# n8n-nodes-qbittorrent

This is an n8n community node. It lets you use qBittorrent in your n8n workflows.

qBittorrent is a software allowing you to download and upload torrents.  
It also has a web server that can be controlled by a Rest API or an integrated web UI.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials) <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage) <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history) <!-- delete if not using this section -->

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

<!-- TEMPLATE -->
<!-- - <operation category> -->
<!-- 	- <operation name>: <operation description> -->

- Torrents
  - getTorrentsList: Get torrents list
  - addTorrent: Add a torrent to the list
- App
  - getAppVersion: Get API version

## Credentials

Before using a node, you have to add a credential.  
This credential should be your server address and the username / password that have access to the web UI.  

Make sure you don't include a slash at the end of the URL, otherwise you may encounter 404 errors when performing various operations.

## Compatibility

This node targets the **qBittorrent WebUI API v2**, and the **primary target is qBittorrent 5.0+**.

qBittorrent 5.0 renamed several torrent-control routes (for example `torrents/pause`/`torrents/resume` became `torrents/stop`/`torrents/start`). To stay compatible across versions, the node auto-detects the qBittorrent major version (via `GET /api/v2/app/version`) and routes accordingly: it uses `stop`/`start` on qBittorrent 5.x, and falls back to `pause`/`resume` on qBittorrent 4.x.

- **qBittorrent 5.0+** is the primary, supported target.
- **qBittorrent 4.x** is supported for now through the version auto-detection fallback, but **backward compatibility is not guaranteed going forward** and may be dropped in a future release.

To avoid breakage with future releases of this node, **keep your qBittorrent instance up to date** (5.0+ recommended).

## Usage (for developpers)

Go into your `n8n-nodes-qbittorrent` directory and create a npm-link :  

```bash
cd <n8n_node_directory>
npm link
```

Run your `n8n` instance :  

```bash
npx n8n
```

Install the package in your n8n instance :  

```bash
cd <n8n_directory>/nodes
npm link n8n-nodes-qbittorrent
```

Then, restart your `n8n` instance and you should be able to add the node to your workflow.

After updating the code, run the `npm run build` command from node directory and restart your n8n instance. 

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- TODO: _Link to app/service documentation._

## Version history

Current version supports the [version 2 of the qBittorrent API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-5.0)).  
If a new qBittorrent API version is released, a new major version of this node will be released.  

TODO: when the node development is completed, we will be on 1.x.y version.

## Supported operations

- application
  - getAppVersion
- torrents
  - getTorrentsList
  - addTorrent
