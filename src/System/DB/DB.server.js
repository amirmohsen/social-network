import {MongoClient, Server} from 'mongodb';
import extend from 'extend';
import Config from '../../Config/Config.server';

let instance;

/**
 * This class wraps the connection to the mongodb database.
 * This class is a singleton.
 */
export default class DB {

	static defaultConfig = {
		host: 'localhost',
		port: '27017'
	};
	static client = null;
	static instance = null;

	config = {};

	constructor() {
		if(!instance){
			this.config = extend(true, {}, DB.defaultConfig, Config.db);
			instance = this;
		}
		return instance;
	}

	/**
	 * Connects to a MongoDB database
	 * @returns {Promise}
	 */
	connect() {
		return new Promise((resolve, reject) => {
			DB.client = new MongoClient(new Server(this.config.host, this.config.port), {
				user: this.config.user,
				password: this.config.pass,
				authSource: this.config.name
			}).connect((err, client) => {
				if(err) {
					return reject(err);
				}
				console.log('DB connected');
				DB.instance = client.db(this.config.name);
				resolve();
			});
		});
	}
}