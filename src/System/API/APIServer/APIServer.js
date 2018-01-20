import express, {Router} from 'express';
import session from 'express-session';
import mongoSessionStore from 'connect-mongo';
import cors from 'cors';
import vhost from 'vhost';
import Config from '../../../Config/Config.server';
import DB from '../../DB/index';
import APIError from '../errors/APIError';
import CSRFTokenManager from './CSRFTokenManager';
import routes from 'src/Modules/routes';
import wrapperAction from './wrapperAction';

const MongoStore = mongoSessionStore(session);

/**
 * Handling API requests
 */
export default class APIServer {

	static CORS_OPTIONS_PRESET = {
		methods: ['GET'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'csrf-token'],
		optionsSuccessStatus: 200,
		credentials: true
	};

	apiApp = express(); // used for server-to-server (machine-to-machine) API requests
	apiRouter = Router();
	frontendAPIRouter = Router(); // used for browser-to-server (human-to-machine) API requests

	run() {
		this.init();
		return this.setup();
	}

	/**
	 * Setting up middleware
	 */
	init() {
		this.apiApp.use((req, res, next) => {
			req.internalAppVars.apiAccessType = 'app';
			next();
		});

		// Setting up the settings for CORS requests
		this.frontendAPIRouter.use(cors(this.corsHandler));

		// Setting up the session
		this.frontendAPIRouter.use(session({
			name: 'session',
			secret: Config.secret,
			saveUninitialized: false,
			resave: false,
			store: new MongoStore({
				db: DB.instance
			}),
			cookie: {
				secure: !!Config.ssl,
				httpOnly: true,
				// domain: `.${Config.domain}`, // disable domain cookie since vhost is treated as optional here
				path: '/api',
				maxAge: 24 * 60 * 60 * 1000 // 24 hours
			}
		}));

		this.frontendAPIRouter.use((req, res, next) => {
			req.internalAppVars.apiAccessType = 'human';
			next();
		});

		// Generating CSRF tokens for browser-to-server calls to prevent attacks
		this.frontendAPIRouter.get(`/csrf-token`, async (req, res) => {
			res.json({
				data: {
					csrfToken: await CSRFTokenManager.generate({req})
				}
			});
		});

		// Validating the tokens submitted
		this.frontendAPIRouter.use(async (req, res, next) => {
			if(await CSRFTokenManager.verify({req})) {
				return next();
			}

			res.status(403).json({
				error: {
					type: APIError.CODES.FORBIDDEN,
					code: 403,
					title: APIError.CODE_DETAILS[APIError.CODES.FORBIDDEN].title,
					message: 'Invalid CSRF token.'
				},
				meta: {
					code: 403,
					invalidCSRFToken: true
				}
			});
		});
	}

	/**
	 * Setting up API routes
	 */
	async setup() {
		let generatedRoutes = await routes();

		this.loadRoutes({
			routes: generatedRoutes,
			baseRouter: this.apiRouter
		});

		this.apiRouter.use((req, res) => {
			res.status(404).json({
				error: {
					type: APIError.CODES.NOT_FOUND,
					code: 404,
					title: APIError.CODE_DETAILS[APIError.CODES.NOT_FOUND].title,
					message: 'Unknown API endpoint.'
				},
				meta: {
					code: 404
				}
			});
		});

		this.apiApp.use(this.apiRouter);
		this.frontendAPIRouter.use(this.apiRouter);
	}

	loadRoutes({routes, baseRouter}) {
		for(let {handler: Handler, route: baseRoute, actions, subRoutes} of routes) {
			let router = Router({ mergeParams: true });

			for(let {name, route, method} of actions) {
				let
					handlerClass = new Handler(),
					originalHandler = handlerClass[name],
					handler = wrapperAction(originalHandler).bind(handlerClass);

				handlerClass[name] = handler;

				router[method.toLowerCase()](route, this.preHandler.bind(this, handler));
			}

			if(subRoutes) {
				this.loadRoutes({
					routes: subRoutes,
					baseRouter: router
				});
			}

			baseRouter.use(baseRoute, router);
		}
	}

	/**
	 * Attaching the API router to the rest of the app
	 * Machine access on "api" subdomain
	 * Human (browser) access on "/api" subdirectory
	 * @param app
	 * @param frontendRouter
	 */
	attach({app, frontendRouter}) {
		app.use(vhost(`${Config.subdomains.api}.${Config.domain}`, this.apiApp));
		frontendRouter.use('/api', this.frontendAPIRouter);
	}

	/**
	 * Request pre-handler that provides a uniform input object to the api.
	 * For instance, body is renamed to data, etc.
	 * @param handler
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise.<void>}
	 */
	async preHandler(handler, req, res, next) {
		const {
			method,
			params,
			headers: metas,
			query: options,
			body: data,
			files = []
		} = req;

		this.send(res, await handler({
			params,
			options,
			data,
			metas,
			req,
			res,
			next,
			method,
			files,
			realRequest: req
		}));
	}

	/**
	 * Formatting and sending the api responses
	 * @param res
	 * @param args
	 */
	send(res, args = {}) {
		const {
			data,
			error,
			meta
		} = args;

		const responseData = {meta};

		if(error) {
			responseData.error = error;
		}
		else {
			responseData.data = data;
		}

		res.status(meta.code).json(responseData);
	}

	/**
	 * CORS handler
	 * @param req
	 * @param callback
	 */
	corsHandler = (req, callback) => {
		let
			allow = false,
			origin = req.get('Origin');

		if(origin === undefined) {
			allow = true;
		}

		callback(null, {
			...this.constructor.CORS_OPTIONS_PRESET,
			origin: allow
		});
	};
}