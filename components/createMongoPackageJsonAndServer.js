const fs = require('fs');
const path = require('path');


exports.createMongoPackageJsonAndServer = (template) => {

	const package_json_path = path.join(__dirname, '..', 'backends', 'backend', 'package.json');

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