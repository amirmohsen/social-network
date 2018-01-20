import {MongoClient, Server} from 'mongodb';
import extend from 'extend';

let instance;

export default class DB {

	static defaultConfig = {
		host: 'localhost',
		port: '27017'
	};
	static instance = null;

	config = {};

	constructor(config) {
		if(!instance){
			this.config = extend(true, {}, DB.defaultConfig, config);
			instance = this;
		}
		return instance;
	}

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