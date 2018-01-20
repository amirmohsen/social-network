import Config from '../../Config';
import {Client} from 'elasticsearch';

let instance;

export default class Search {

	client;

	constructor() {
		if(!instance){
			this.client = new Client({
				host: `${Config.search.host}:${Config.search.port}`,
				log: 'trace'
			});
			instance = this;
		}
		return instance;
	}

	async run() {
		try {
			await this.client.ping({
				requestTimeout: 30000,
			});
		}
		catch(e) {
			console.error(e);
			return console.log('ElasticSearch is down!');
		}
		console.log('ElasticSearch is up!');
	}
}