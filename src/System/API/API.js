import routes from '../../Modules/routes';
import APIClient from './APIClient';

/**
 * Base API class for all API calls both on the frontend and backend.
 */
export default class API {}

const loadRoutes = ({routes, base, parentRoute = null}) => {
	// The fields and methods are dynamically generated from the routes
	for(let {name, route: baseRoute, actions, handler: Handler, subRoutes} of routes) {
		base[name] = new APIClient({
			name,
			baseRoute: parentRoute ? `${parentRoute}${baseRoute}` : baseRoute,
			actions,
			instance: IS_SERVER ? new Handler() : null
		});

		if(subRoutes) {
			loadRoutes({
				routes: subRoutes,
				base: API[name],
				parentRoute: baseRoute
			});
		}
	}
};

export const setup = async () => {
	let generatedRoutes = await routes();
	loadRoutes({
		routes: generatedRoutes,
		base: API
	});
};