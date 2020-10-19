const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');


exports.createRoutes = (template) => {

	const routes_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'routes');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let routes_file_path = path.join(routes_path, `${tables[i].toLowerCase()}.routes.js`);

		let routes_array = ``;

		let default_routes = Object.keys(default_values.default_routes);

		let my_tables_routes = Object.keys(template.db.tables[tables[i]].routes);

		for(j=0; j<my_tables_routes.length; j++){
			routes_array += `router.${template.db.tables[tables[i]].routes[my_tables_routes[j]].method}("${template.db.tables[tables[i]].routes[my_tables_routes[j]].route}", validate('${my_tables_routes[j]}'), ${tables[i].toLowerCase()}.${my_tables_routes[j]});\n    `;
		}

		for(k=0; k<default_routes.length; k++){
			if(template.db.tables[tables[i]].routes[default_routes[k]] === undefined){
				routes_array += `router.${default_values.default_routes[default_routes[k]].method}("${default_values.default_routes[default_routes[k]].route}", validate('${default_routes[k]}'), ${tables[i].toLowerCase()}.${default_routes[k]});\n    `;
			}
		}

		let routes = `// Import controller.
const ${tables[i].toLowerCase()} = require('../controllers/${tables[i].toLowerCase()}.controller.js');

// Import validation and security middlewares.
const { validate } = require('../middlewares/validation/${tables[i].toLowerCase()}.validation.middlewares');

// Create router object.
let router = require("express").Router();

	// Define ${tables[i]} routes.
	${routes_array}
// Export router with all of our routes.
module.exports = router;`;

		fs.writeFileSync(routes_file_path, routes);
	}

}