const fs = require('fs');
const path = require('path');

const utils = require('./utils/utils.js');

const createMongoPackageJsonAndServer = (template) => {
	const package_json_path = path.join(__dirname, 'backends', 'backend', 'package.json');

	let package_json = {};

	package_json.name = template.package_json["name"] || "default";
	package_json.version = template.package_json["version"] || "v1.0.0";
	package_json.description = template.package_json["description"] || "default";
	package_json.main = template.package_json["main"] || "server.js";
	package_json.scripts = template.package_json["scripts"] || { "test": "echo \"Error: no test specified\" && exit 1" };
	package_json.author = template.package_json["author"] || "default";
	package_json.license = template.package_json["license"] || "ISC";
	package_json.dependencies = template.package_json["dependencies"] || { "body-parser": "^1.19.0", "express": "^4.17.1", "express-validator": "^6.6.1", "jsonwebtoken": "^8.5.1", "mongoose": "^5.9.21" };

	fs.writeFileSync(package_json_path, JSON.stringify(package_json, null, 2));
}

const createSqlPackageJsonAndServer = (template) => {
	const package_json_path = path.join(__dirname, 'backends', 'backend', 'package.json');

	let package_json = {};

	package_json.name = template.package_json["name"] || "default";
	package_json.version = template.package_json["version"] || "v1.0.0";
	package_json.description = template.package_json["description"] || "default";
	package_json.main = template.package_json["main"] || "server.js";
	package_json.scripts = template.package_json["scripts"] || { "test": "echo \"Error: no test specified\" && exit 1" };
	package_json.author = template.package_json["author"] || "default";
	package_json.license = template.package_json["license"] || "ISC";
	package_json.dependencies = template.package_json["dependencies"] || { "body-parser": "^1.19.0", "express": "^4.17.1", "express-validator": "^6.6.1", "jsonwebtoken": "^8.5.1", "mysql2": "^2.2.2", "node-fetch": "^2.6.1", "sequelize": "^6.3.5" };

	fs.writeFileSync(package_json_path, JSON.stringify(package_json, null, 2));
}

const createScaffolding = () => {
	const base_path = path.join(__dirname, 'backends', 'backend');

	const readme_file_path = path.join(base_path, 'README.md');
	fs.writeFileSync(readme_file_path, '');

	const app_path = path.join(base_path, 'app');
	fs.mkdirSync(app_path);

	const config_path = path.join(app_path, 'config');
	fs.mkdirSync(config_path);

	const controllers_path = path.join(app_path, 'controllers');
	fs.mkdirSync(controllers_path);

	const middlewares_path = path.join(app_path, 'middlewares');
	fs.mkdirSync(middlewares_path);

	const errors_middlewares_path = path.join(middlewares_path, 'errors');
	fs.mkdirSync(errors_middlewares_path);

	const validation_middlewares_path = path.join(middlewares_path, 'validation');
	fs.mkdirSync(validation_middlewares_path);

	const resources_path = path.join(app_path, 'resources');
	fs.mkdirSync(resources_path);

	const models_path = path.join(app_path, 'models');
	fs.mkdirSync(models_path);

	const routes_path = path.join(app_path, 'routes');
	fs.mkdirSync(routes_path);

	const utils_path = path.join(app_path, 'utils');
	fs.mkdirSync(utils_path);
}

const createServer = (template) => {
	const server_path = path.join(__dirname, 'backends', 'backend', 'server.js');

	let routes = "";
	let routes_middlewares = "";
	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		routes += `const ${tables[i].toLowerCase()}_routes = require('./app/routes/${tables[i].toLowerCase()}.routes');\n`;
		routes_middlewares += `app.use('/api/${tables[i].toLowerCase()}', ${tables[i].toLowerCase()}_routes);\n`;
	}

	const server = `//Importing external and core packages.
const express = require('express');
const bodyParser = require('body-parser');

// Importing routes.
${routes}
// Importing errors and security middlewares.
const { errorHandler } = require('./app/middlewares/errors/server.errors.middlewares');

const app = express();

// Parse requests of content-type - application/json.
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded.
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to database between Sequelize and doing a database dump to operate with some info when 
// developing the app.
const db = require("./app/models");
db.sequelize.sync().then(() => {
  console.log('Sync to database.');
});

// Adding the routes previously imported.
${routes_middlewares}
// Managing application errors throwed in the course of server operations.
app.use(errorHandler);

// Listen for requests.
app.listen(process.env.PORT || ${template.global.server_port}, () => {
  console.log('Server is running on port ${template.global.server_port}.');
});`;

	fs.writeFileSync(server_path, server);
}

const createConstantsFile = (template) => {
	const constants_file_path = path.join(__dirname, 'backends', 'backend', 'app', 'config', 'constants.js');

	const constants = `module.exports = {
	db_config: {
		HOST: "${template.host}",
  		USER: "${template.user}",
  		PASSWORD: "${template.password}",
  		DB: "${template.name}",
  		DIALECT: "mysql"
	},
	http_codes:{
		OK: 200,
		BAD_REQUEST: 400,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		INTERNAL_SERVER_ERROR: 500,
		ALREADY_EXISTS: 409
	}
}`;

	fs.writeFileSync(constants_file_path, constants);
}

const createDbConfig = () => {
	const db_config_path = path.join(__dirname, 'backends', 'backend', 'app', 'config', 'db.config.js');

	const db_config = `/*
* Sequelize package needs this configuration in order to establish connection with our database.
*/
const constants = require("./constants");

module.exports = {
  HOST: constants.db_config.HOST,
  USER: constants.db_config.USER,
  PASSWORD: constants.db_config.PASSWORD,
  DB: constants.db_config.DB,
  dialect: constants.db_config.DIALECT
};`;

	fs.writeFileSync(db_config_path, db_config);
}

// HAY QUE TERMINAR EL TEMA DE LOS PARÁMETROS DE VALIDACIÓN Y LOS PARÁMETROS EN GENERAL!!!!!!
const createControllers = (template) => {
	const controllers_path = path.join(__dirname, 'backends', 'backend', 'app', 'controllers');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let controller_path = path.join(controllers_path, `${tables[i].toLowerCase()}.controller.js`);

		let controller = `// Sequelize imports to interact with database.
const db = require("../models");
const ${tables[i]} = db.${tables[i].toLowerCase()};
const Op = db.Sequelize.Op;

// Importing external and core packages
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Importing own packages
const cnsts = require("../config/constants");
const { manageBadRequests, createError, createResponse, isEmptyArray } = require("../utils/utils");

/**
* @api {post} /api/companies
*
* @apiParam {String} name
* @apiParam {String} cif
* @apiParam {String} email
* @apiParam {String} description
* @apiParam {String} logo
* @apiParam {String} [shortdesc]
* @apiParam {String} [ccc]
* @apiParam {String} [date]
* @apiParam {Boolean} [status]
*/
exports.create = async (req, res, next) => {

  try{

    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      manageBadRequests(req);
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Extract params from req.body.
    const { name, description, email, cif, logo, shortdesc, ccc, date, status} = req.body;

    // Looking for an existing row of this company on database.
    let query_company = await Company.findAll({ where: { [Op.or]: [{ cif }, { name }] } });
    if(!isEmptyArray(query_company)) throw createError(409, 'A company with this CIF or name already exists on database');

    // Create company object and database row.
    const company = { name, description, email, cif, logo, shortdesc, ccc, date, status,
                      token: crypto.createHash(cnsts.controllers.company.HASH_ALGORITHM).update(req.body.name + req.body.cif + new Date().getMilliseconds()).digest(cnsts.controllers.company.DIGEST)
    };

    let data = await Company.create(company);

    res.status(200).json(createResponse(200, 'Success creating a new company on db', data));

  }catch(err){ next(err); }

};

/**
* @api {put} /api/companies/:id
*
* @apiParam {Number} id Company unique ID.
*
* @apiParam {String} [name]
* @apiParam {String} [cif]
* @apiParam {String} [email]
* @apiParam {String} [description]
* @apiParam {String} [logo]
* @apiParam {String} [shortdesc]
* @apiParam {String} [ccc]
* @apiParam {String} [date]
* @apiParam {Boolean} [status]
*/
exports.update = async (req, res, next) => {

  try{

    // Looking for our company and updating it.
    const id = req.params.id;

    let data = await Company.update(req.body, { where: { id: id } });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the company id that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Company was successfully updated', null));

  }catch(err){ next(err); }

};

/**
* @api {get} /api/companies
*
* @apiParam {Number} [page]
*/
exports.findAll = async (req, res, next) => {

  try{

    // Create pagination values.
    let page = Number(req.query.page) || cnsts.controllers.company.MIN_PAGE;
    let offset = (page - cnsts.controllers.company.MIN_PAGE) * cnsts.controllers.company.OFFSET_PAGINATION_FACTOR;
    let limit = cnsts.controllers.company.DEFAULT_LIMIT;

    // Listing companies.
    let data = await Company.findAll({ offset, limit, attributes: [ 'id', 'name', 'shortdesc', 'description', 'email', 'date', 'status', 'logo'] });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the page that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Success retrieving companies list', data));

  }catch(err){ next(err); }

};

/**
* @api {get} /api/companies/:pattern
*
* @apiParam {String} pattern included on the description of a company.
*/
exports.search = async (req, res, next) => {

  try{

    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      manageBadRequests(req);
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Searching on database for the company that contains our pattern inside its description.
    let sql_query_pattern = '%' + req.params.pattern + '%';

    let data = await Company.findAll({ where: { description: { [Op.like]: sql_query_pattern } }, 
                                       attributes: [ 'id', 'name', 'shortdesc', 'description', 'email', 'date', 'status', 'logo'] });
      
    res.status(200).json(createResponse(200, 'Success retrieving companies by pattern', data));

  }catch(err){ next(err); }

};`;

		fs.writeFileSync(controller_path, controller);
	}
}

const createErrorsMiddlewares = () => {
	const errors_middlewares_path = path.join(__dirname, 'backends', 'backend', 'app', 'middlewares', 'errors', 'server.errors.middlewares.js');

	const errors_middleware = `/*
* This is the erros middlewares file. It only has a simple function that manage all the errors that were
* throwed by all the methods of the api, inside of server.js.
*/
const { createResponse } = require('../../utils/utils');

exports.errorHandler = (error, req, res, next) => {
	res.status(error.statusCode || 500).json(createResponse(error.statusCode || 500, error.message, error.data || null));
}`;

	fs.writeFileSync(errors_middlewares_path, errors_middleware);
}

// TERMINAR Y PENSAR BIEN CÓMO METER LA VALIDACIÓN ENTERA EN LA TEMPLATE!!!!!!
const createValidationMiddlewares = () => {
	const validation_middlewares_path = path.join(__dirname, 'backends', 'backend', 'app', 'middlewares', 'validation');
}

// TERMINAR!!!!!!
const createModels = (template) => {
	const models_path = path.join(__dirname, 'backends', 'backend', 'app', 'models');

	let model_in_index = "";
	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let model_path = path.join(models_path, `${tables[i].toLowerCase()}.model.js`);

		let model = ``;

		fs.writeFileSync(model_path, model);
	}
}

const createRoutes = (template) => {
	const routes_path = path.join(__dirname, 'backends', 'backend', 'app', 'routes');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let routes_file_path = path.join(routes_path, `${tables[i].toLowerCase()}.routes.js`);

		let routes = `// Import controller.
const ${tables[i].toLowerCase()} = require('../controllers/${tables[i].toLowerCase()}.controller.js');

// Import validation and security middlewares.
const { validate } = require('../middlewares/validation/${tables[i].toLowerCase()}.validation.middlewares');

// Create router object.
let router = require("express").Router();

	// Define ${tables[i]} routes.
	router.post("/", validate('create'), ${tables[i].toLowerCase()}.create);
	router.put("/:id", validate('update'), ${tables[i].toLowerCase()}.update);
	router.get("/", validate('findAll'), ${tables[i].toLowerCase()}.findAll);
	router.get("/:pattern", validate('search'), ${tables[i].toLowerCase()}.search);

// Export router with all of our routes.
module.exports = router;`;

		fs.writeFileSync(routes_file_path, routes);
	}
}

const createUtilsFile = () => {
	const utils_file_path = path.join(__dirname, 'backends', 'backend', 'app', 'utils', 'utils.js');

	const utils_file = `  
/*
* This is the utils file, containing some utils functions located along the code. Some functions as 
* 'isEmptyArray' or 'isUndefined' act like a validator package as lodash, but without the whole bunch
* of mess that this package introduce inside node_modules, not to mention the vulnerabilites. The other
* functions are destined to create responses to send to the fronted ('createResponse'), create errors 
* that will be thrown along the code ('createError') and manage the bad requests that reach the server 
* creating a blacklist file to identify possible and dangerous hackers, and avoiding attacks to our api 
* (manageBadRequests).
*/

// Importing external and core packages.
const fs = require('fs');
const path = require('path');

// Creating the blacklist file path.
const blacklist_path = path.join(__dirname, '..', '/resources/blacklist.json');


exports.isEmptyArray = (myArray) => {
	return (myArray.length < 1 || myArray === undefined) ? true : false;
}

exports.isUndefined = (myVar) => {
	return (myVar === undefined) ? true : false;
}

exports.createResponse = (status, message, data) => {

	// We check if the response if an error or not. And besides it, we check if we need to include
	// some data on the response.
	if(status != 200) {
		if(data!= null) {
			return { ok: false, status, error: { message, data } };
		} else {
			return { ok: false, status, error: { message } };
		}
	} else {
		if(data!= null) {
			return { ok: true, status, result: { message, data } };
		} else {
			return { ok: true, status, result: { message } };
		}
	}
	
}

exports.createError = (status, message, data) => {
	let error = new Error(message);
	error.statusCode = status;
	if(data) error.data = data;

	return error;
}

exports.manageBadRequests = async (req) => {
	// Create, if not exists, a blacklist file.
	if(!fs.existsSync(blacklist_path)) fs.writeFileSync(blacklist_path, JSON.stringify({ hacker_list: [], requests_list: [] }, null, 2));

	// We read and parse the file.
	const blacklist_raw = fs.readFileSync(blacklist_path);
	let blacklist = JSON.parse(blacklist_raw);
	
	// Create a new bad request object with the interesting data of the requests to detect hackers.
	let bad_request_object = {
		date: new Date(),
		baseUrl: req.baseUrl,
		method: req.method,
		hostname: req.hostname,
		ip: req.ip,
		ips: req.ips,
		originalUrl: req.originalUrl,
		path: req.path,
		protocol: req.protocol,
		secure: req.secure,
		subdomains:req.subdomains,
		body: req.body,
		params: req.params,
		query: req.query,
		cookies: req.cookies
	};
 	
 	// Include the new object on a list and the requests ip on another list (To faster prevent hacker attacks).
	if(!blacklist.hacker_list.includes(req.ip)) blacklist.hacker_list.push(req.ip);
	blacklist.requests_list.push(bad_request_object);

	// Overwrite the blacklist with the new information.
	fs.writeFileSync(blacklist_path, JSON.stringify(blacklist, null, 2));
}`;

	fs.writeFileSync(utils_file_path, utils_file);
}

const createBackend = async () => {

	const template = utils.readTemplate();

	await utils.clearBackendFolder();

	if(template.global.db_type == "sql"){
		createSqlPackageJsonAndServer(template);
	} else {
		createMongoPackageJsonAndServer(template);
	}
	
	createScaffolding();

	createServer(template);

	createConstantsFile(template.db);

	createDbConfig();

	createControllers(template);

	createErrorsMiddlewares();

	createValidationMiddlewares();

	createModels(template);

	createRoutes(template);

	createUtilsFile();

}

createBackend();