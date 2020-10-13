const fs = require('fs');
const path = require('path');


exports.createServer = (template) => {

	const server_path = path.join(__dirname, '..', 'backends', 'backend', 'server.js');

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