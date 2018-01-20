import 'isomorphic-fetch';
import DB from '../utils/DB';
import serverConfig from '../config/server.json';

let db;

beforeAll(async () => {
	db = new DB(serverConfig.db);
	return db.connect();
});

beforeEach(() => DB.instance.dropDatabase());

afterAll(async () => {
	await DB.instance.dropDatabase();
	return DB.instance.close();
});