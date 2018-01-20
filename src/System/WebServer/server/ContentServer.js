import React from 'react';
import {readFile} from 'fs-extra';
import Config from 'src/Config/Config.server';
import {Helmet} from 'react-helmet';

/**
 * Handling frontend requests
 */
export default class ContentServer {

	vendorAssetsConfig = {};
	assetsConfig = {};
	assets = {};

	constructor() {
		this._readAssets();
	}

	/**
	 *
	 * @param req
	 * @param res
	 * @returns {Promise.<void>}
	 */
	async run(req, res) {
		if(Config.isDev) {
			await this._readAssets(); // In dev, we keep reading the asset config on every request as it could change
		}

		res.status(200).send(this._render());
	}

	/**
	 * Reading asset webpack asset configs
	 * @returns {Promise.<void>}
	 * @private
	 */
	async _readAssets() {
		if(Config.isDev) {
			this.vendorAssetsConfig = JSON.parse(await readFile(`${Config.dirs.dist}/webpack-vendor-assets.json`, 'utf8'));
		}
		this.assetsConfig = JSON.parse(await readFile(`${Config.dirs.dist}/webpack-assets.json`, 'utf8'));
		this._createImports();
	}

	/**
	 * Creating import statements from webpack asset configs for the page
	 * @private
	 */
	_createImports() {
		this.assets = {
			css: '',
			js: ''
		};

		let order = [
			'runtime', // Webpack runtime - used only in dev
			'vendor', // All vendor code - used only in dev
			'client' // In prod, all client code but in dev, only our code
		];

		const assetsConfig = {
			...this.vendorAssetsConfig,
			...this.assetsConfig
		};

		for(let name of order) {
			const assets = assetsConfig[name];

			if(!assets) {
				continue;
			}

			if(assets.js) {
				this.assets.js += `<script src="${assets.js}"></script>\n`;
			}

			if(assets.css) {
				this.assets.css += `<link rel="stylesheet" type="text/css" href="${assets.css}">\n`;
			}
		}
	}

	/**
	 * Render the base page
	 * @returns {string}
	 * @private
	 */
	_render() {
		let head = Helmet.renderStatic();
		return (
			`<!DOCTYPE html>\n\n
			<html ${head.htmlAttributes.toString()}>
				<head>
					${head.title.toString()}
					${head.meta.toString()}
					${head.link.toString()}
					${this.assets.css}
					<meta
  						name="viewport"
  						content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
  					/>
				</head>
				<body>
					<div class="app-main-wrapper"></div>
					${this.assets.js}
				</body>
			</html>`
		);
	}
}