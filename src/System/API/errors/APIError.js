import BaseError from 'src/System/BaseError/BaseError';

/**
 * Used for throwing API errors with built-in http code constants
 */
export default class APIError extends BaseError {

	static CODES = {
		BAD_REQUEST: 'BAD_REQUEST',
		UNAUTHORIZED: 'UNAUTHORIZED',
		FORBIDDEN: 'FORBIDDEN',
		NOT_FOUND: 'NOT_FOUND',
		NOT_ALLOWED: 'NOT_ALLOWED',
		INTERNAL_ERROR: 'INTERNAL_ERROR'
	};

	static CODE_DETAILS = {
		BAD_REQUEST: {
			code: 400,
			title: 'Wrong arguments.'
		},
		UNAUTHORIZED: {
			code: 401,
			title: 'Unauthorized'
		},
		FORBIDDEN: {
			code: 403,
			title: 'Access Denied'
		},
		NOT_FOUND: {
			code: 404,
			title: 'Not Found'
		},
		NOT_ALLOWED: {
			code: 405,
			title: 'Not Allowed'
		},
		INTERNAL_ERROR: {
			code: 500,
			title: 'Internal Error'
		}
	};

	/**
	 *
	 * @param args
	 */
	constructor(args) {
		super(args.message || '');
		this.setup(args)
	}

	/**
	 *
	 * @param type
	 * @param message
	 * @param details
	 */
	setup({type, message = '', details = {}}) {
		this.type = type;
		this.message = message;
		this.title = this.constructor.CODE_DETAILS[this.type].title;
		this.code = this.constructor.CODE_DETAILS[this.type].code;
		this.details = details;
	}
}