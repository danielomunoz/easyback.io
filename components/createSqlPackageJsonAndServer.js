const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');
const { setVars, isUndefined } = require('../utils/utils.js');


exports.createSqlPackageJsonAndServer = (template) => {
	
	let [ package_json_path, package_json, inner_package_json_values ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'package.json'), {}, ["name", "version", "description", "main", "scripts", "author", "license", "dependencies"]);

	if(isUndefined(template["package_json"])) {

		package_json = default_values.default_sql_package_json;
		
	} else {

		inner_package_json_values.forEach( package_json_value => {

			if(!template.package_json[package_json_value]){
				package_json[package_json_value] = default_values.default_sql_package_json[package_json_value];
			} else {
				package_json[package_json_value] = template.package_json[package_json_value];
			}
		
		});
	}

	fs.writeFileSync(package_json_path, JSON.stringify(package_json, null, 2));

}