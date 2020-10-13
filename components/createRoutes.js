const fs = require('fs');
const path = require('path');


exports.createRoutes = (template) => {

	const routes_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'routes');

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