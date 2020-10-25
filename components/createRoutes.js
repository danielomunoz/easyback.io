const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');
const { isUndefined, setVars } = require('../utils/utils.js');


exports.createRoutes = (tables_object) => {

	let [ routes_path, tables ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'app', 'routes'), Object.keys(tables_object));

	tables.forEach( table => {

		let [ routes_file_path, routes_lines, default_routes, custom_routes ] = setVars(path.join(routes_path, `${table.toLowerCase()}.routes.js`), ``, Object.keys(default_values.default_routes), Object.keys(tables_object[table].routes));

		custom_routes.forEach( custom_route => {
			routes_lines += `router.${tables_object[table].routes[custom_route].method || default_values.default_routes[custom_route].method}("${tables_object[table].routes[custom_route].route || default_values.default_routes[custom_route].route}", validate('${custom_route}'), ${table.toLowerCase()}.${custom_route});\n    `;
		});

		default_routes.forEach( default_route => {
			if(isUndefined(tables_object[table].routes[default_route])){
				routes_lines += `router.${default_values.default_routes[default_route].method}("${default_values.default_routes[default_route].route}", validate('${default_route}'), ${table.toLowerCase()}.${default_route});\n    `;
			}
		});

		let routes = returnRoutesFile(table, routes_lines);

		fs.writeFileSync(routes_file_path, routes);

	});

}

const returnRoutesFile = (table, routes_lines) => {

/*
*

// Import controller.
const ${table.toLowerCase()} = require('../controllers/${table.toLowerCase()}.controller.js');

// Import validation and security middlewares.
const { validate } = require('../middlewares/validation/${table.toLowerCase()}.validation.middlewares');

// Create router object.
let router = require("express").Router();

	// Define ${table} routes.
	${routes_lines}
// Export router with all of our routes.
module.exports = router;

*
*/

return `// Import controller.\nconst ${table.toLowerCase()} = require('../controllers/${table.toLowerCase()}.controller.js');\n\n// Import validation and security middlewares.\nconst { validate } = require('../middlewares/validation/${table.toLowerCase()}.validation.middlewares');\n\n// Create router object.\nlet router = require("express").Router();\n\n    // Define ${table} routes.\n    ${routes_lines}\n// Export router with all of our routes.\nmodule.exports = router;`;

}