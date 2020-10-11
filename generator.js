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

}

createBackend();