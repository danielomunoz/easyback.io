const fs = require('fs');
const path = require('path');

const { setVars } = require('../utils/utils.js');

exports.createServer = (tables_object, server_port) => {

	let [ server_path, routes_imports, routes_middlewares, tables ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'server.js'), ``, ``, Object.keys(tables_object));

	tables.forEach( table => {
	  routes_imports += `const ${table.toLowerCase()}_routes = require('./app/routes/${table.toLowerCase()}.routes');\n`;
	  routes_middlewares += `app.use('/api/${table.toLowerCase()}', ${table.toLowerCase()}_routes);\n`;
	});

	fs.writeFileSync(server_path, returnServer(routes_imports, routes_middlewares, server_port || 3000));
}

const returnServer = (routes_imports, routes_middlewares, server_port) => {

/*
*

//Importing external and core packages.
const express = require('express');
const bodyParser = require('body-parser');

// Importing routes.
${routes_imports}

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
app.listen(process.env.PORT || ${server_port}, () => {
  console.log('Server is running on port ${server_port}.');
});

*
*/

return `//Importing external and core packages.\nconst express = require('express');\nconst bodyParser = require('body-parser');\n\n// Importing routes.\n${routes_imports}\n// Importing errors and security middlewares.\nconst { errorHandler } = require('./app/middlewares/errors/server.errors.middlewares');\n\nconst app = express();\n\n// Parse requests of content-type - application/json.\napp.use(bodyParser.json());\n\n// Parse requests of content-type - application/x-www-form-urlencoded.\napp.use(bodyParser.urlencoded({ extended: true }));\n\n// Connecting to database between Sequelize and doing a database dump to operate with some info when \n// developing the app.\nconst db = require("./app/models");\ndb.sequelize.sync().then(() => {\n  console.log('Sync to database.');\n});\n\n// Adding the routes previously imported.\n${routes_middlewares}\n// Managing application errors throwed in the course of server operations.\napp.use(errorHandler);\n\n// Listen for requests.\napp.listen(process.env.PORT || ${server_port}, () => {\n  console.log('Server is running on port ${server_port}.');\n});`;

}