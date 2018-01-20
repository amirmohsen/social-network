import {resolve} from 'path';
import API, {setup as apiSetup} from '../../System/API';
import DB from '../DB';
import BackendServer from '../WebServer';
import Logger from '../Logger';
import Config from '../../Config';
import Search from '../Search/Search';

/**
 * The server-side bootstrap initializes the config,
 * starts the database connection and the web server in sequence
 */
export default class Bootstrap {

	constructor() {
		Config.init({
			isDev: IS_DEVELOPMENT,
			root: resolve(__dirname, '../../../')
		});
		this.setup();
	}

	async setup() {
		Logger.init();
		await this.setupDB();
		await this.setupSearch();
		await apiSetup();
		await this.setupWebServer();
		await this.setupRootUser();
	}

	setupDB() {
		this.db = new DB();
		return this.db.connect();
	}

	setupSearch() {
		this.search = new Search();
		return this.search.run();
	}

	async setupRootUser() {
		try {
			this.collection = DB.instance.collection('users');

			let doc = await this.collection.findOne({
				email: 'root@example.com'
			});

			if(!doc) {
				await API
					.users
					.create({
						data: {
							firstName: 'Root',
							lastName: 'Root',
							email: 'root@example.com',
							password: 'root',
							isAdmin: true
						}
					});
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	setupWebServer() {
		this.webServer = new BackendServer();
		return this.webServer.run();
	}
}