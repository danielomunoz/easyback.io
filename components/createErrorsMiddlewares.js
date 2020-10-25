const fs = require('fs');
const path = require('path');


exports.createErrorsMiddlewares = () => {
	
	const errors_middlewares_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'middlewares', 'errors', 'server.errors.middlewares.js');

	fs.writeFileSync(errors_middlewares_path, returnErrorsMiddleware());
}

const returnErrorsMiddleware = () => {

/*
*

// This is the erros middlewares file. It only has a simple function that manage all the errors that were
// throwed by all the methods of the api, inside of server.js.
const { createResponse } = require('../../utils/utils');

exports.errorHandler = (error, req, res, next) => {
	res.status(error.statusCode || 500).json(createResponse(error.statusCode || 500, error.message, error.data || null));
}

*
*/

return `// This is the erros middlewares file. It only has a simple function that manage all the errors that were\n// throwed by all the methods of the api, inside of server.js.\nconst { createResponse } = require('../../utils/utils');\n\nexports.errorHandler = (error, req, res, next) => {\n    res.status(error.statusCode || 500).json(createResponse(error.statusCode || 500, error.message, error.data || null));\n}`;

}