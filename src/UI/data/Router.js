import createHistory from 'history/createBrowserHistory';
import { routerReducer, routerMiddleware } from 'react-router-redux';

export const history = createHistory();
export const middleware = routerMiddleware(history);
export const reducer = routerReducer;