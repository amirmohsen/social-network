import {readFile} from 'fs-extra';
import {createServer} from 'http';
import express, {Router} from 'express';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import vhost from 'vhost';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import requestIp from 'request-ip';
import Config from 'src/Config/Config.server';
import ContentServer from './ContentServer';
import APIServer from '../../API/APIServer/APIServer';
import APIError from '../../API/errors/APIError';

/**
 * Setting up the backend server to handle requests
 */
export default class BackendServer {

	app = express();
	frontendRouter = Router();
	apiServer = null;
	frontendServer = null;
	internalServerInstance = null;

	constructor() {
		this.apiServer = new APIServer();
		this.frontendServer = new ContentServer();
	}

	async run() {
		this.setupAppMiddleware();
		this.setupStaticServer();
		await this.setupAPIServer();
		this.setupFrontendServer();
		this.handleErrors();
		return new Promise(this.runServer);
	}

	/**
	 * Setting up the server middleware
	 */
	setupAppMiddleware() {
		// small security protections by adjusting request headers
		this.app.use(helmet());

		// adding the request's client ip
		this.app.use(requestIp.mw());

		if(Config.isDev) {
			// Log requests in the console in dev mode
			this.app.use(morgan('dev'));
		}
		else {
			// Compress responses in prod mode
			this.app.use(compression());
		}

		// decode json-body requests
		this.app.use(bodyParser.json());

		// TODO: Move mongo sanitation to save actions
		// sanitizing request data for mongo-injection attacks
		this.app.use(mongoSanitize());

		// any internal data that is needed to be attached to the request must be attached to the "internalAppVars" object
		this.app.use((req, res, next) => {
			req.internalAppVars = {};
			next();
		});
	}

	/**
	 * On a real production server, nginx would be used for serving assets
	 */
	setupStaticServer() {
		this.app.use(
			vhost(
				`${Config.subdomains.static}.${Config.domain}`,
				express.static(Config.dirs.static)
			)
		);

		// if(Config.isProd) {

			this.app.use(Config.paths.assets, express.static(Config.dirs.assets));
		// }
	}

	/**
	 * Setting up the API server
	 */
	async setupAPIServer() {
		await this.apiServer.run();
		this.apiServer.attach({
			app: this.app,
			frontendRouter: this.frontendRouter
		});
	}

	/**
	 * Setting up the frontend server
	 */
	setupFrontendServer() {
		// All other requests are served react views
		this.frontendRouter.get('/*', this.frontendServer.run.bind(this.frontendServer));

		// Setting up the vhost
		this.app.use(vhost(Config.domain, this.frontendRouter));

		// Exposing it without vhost for easier usage
		this.app.use(this.frontendRouter);
	}

	/**
	 * Request error fallback
	 */
	handleErrors() {
		// Any uncaught request error generates a 500 internal error
		this.app.use((err, req, res, next) => {
			if(err) {
				console.error(err);
				res.status(500).json({
					error: {
						type: APIError.CODES.INTERNAL_ERROR,
						code: 500,
						title: 'Internal Error',
						message: 'An unknown error occurred.'
					},
					meta: {
						code: 500
					}
				});
			}
			else {
				next();
			}
		});
	}

	/**
	 * Create server and start listening
	 * @param resolve
	 */
	runServer = resolve => {
		this.internalServerInstance = createServer(this.app);
		this.internalServerInstance.listen(
			Config.port,
			() => {
				console.log(`Listening on port ${Config.port}`);
				resolve();
			}
		);
	};
}