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
  - getApiVersion: Get API version

## Credentials

Before using a node, you have to add a credential.  
This credential should be your server address and the username / password that have access to the web UI.

## Compatibility

TODO: _State the minimum n8n version, as well as which versions you test against. You can also include any known version incompatibility issues._

## Usage

Install the node into your configuration :  

```bash
mkdir -p <n8n_directory>/custom # if the directory does not already exist
cd <n8n_directory>/custom
npm init # if not already initiated
npm install --save n8n-nodes-qbittorrent
```

Then, you just need to restart your n8n instance, and you should see the node by searching "qBittorrent" in the nodes searchbar.  

If you are not already familiar with n8n basics, don't hesitate to [Try it out](https://docs.n8n.io/try-it-out/) to get started.

## Usage (for developpers)

Go into your `n8n-nodes-qbittorrent` directory and create a npm-link :  

```bash
cd <n8n_node_directory>
npm link # run in sudo if permission denied
```

Create and init the `custom` directory and install your local node version :  

```bash
mkdir -p <n8n_directory>/custom # if the directory does not already exist
cd <n8n_directory>/custom
npm init # if not already initiated
npm link n8n-nodes-qbittorrent
```

Now the QBittorrent node is available in your n8n instance.  

To update the node, run the `npm run build` command from node directory and restart your n8n instance. 

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- TODO: _Link to app/service documentation._

## Version history

Current version supports the version 2 of the qBittorrent API.  
If a new qBittorrent API version is released, a new major version of this node will be released.  

TODO: when the node development is completed, we will be on 1.x.y version.