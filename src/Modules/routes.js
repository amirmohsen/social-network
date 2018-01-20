/**
 * API routes
 */
export default async () => {
	const
		{APIHandler: UserAPIHandler} = await import('./User'),
		{APIHandler: ConnectionAPIHandler} = await import('./User/Connection');

	return [
		{
			handler: UserAPIHandler,
			name: 'users',
			route: '/users',
			actions: [
				{
					method: 'GET',
					name: 'current',
					route: '/current'
				},
				{
					method: 'GET',
					name: 'read',
					route: '/:id?'
				},
				{
					method: 'POST',
					name: 'create',
					route: '/'
				},
				{
					method: 'PUT',
					name: 'update',
					route: '/:id'
				},
				{
					method: 'DELETE',
					name: 'remove',
					route: '/:id?'
				},
				{
					method: 'POST',
					name: 'login',
					route: '/login'
				},
				{
					method: 'POST',
					name: 'logout',
					route: '/logout'
				}
			],
			subRoutes: [
				{
					handler: ConnectionAPIHandler,
					name: 'connections',
					route: '/:userId/connections',
					actions: [
						{
							method: 'GET',
							name: 'read',
							route: '/'
						},
						{
							method: 'POST',
							name: 'create',
							route: '/'
						},
						{
							method: 'DELETE',
							name: 'remove',
							route: '/:id'
						}
					]
				}
			]
		}
	];
};