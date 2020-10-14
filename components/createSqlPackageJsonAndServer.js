const fs = require('fs');
const path = require('path');


exports.createSqlPackageJsonAndServer = (template) => {
	
	const package_json_path = path.join(__dirname, '..', 'backends', 'backend', 'package.json');

	let package_json = {};

	const default_values = require('../utils/utils.json');

	let inner_package_json_values = ["name", "version", "description", "main", "scripts", "author", "license", "dependencies"];

	for(i=0; i<inner_package_json_values.length; i++){

		if(template["package_json"] !== undefined){

			if(!template.package_json[inner_package_json_values[i]]){
				package_json[inner_package_json_values[i]] = default_values.default_sql_package_json[inner_package_json_values[i]];
			} else {
				package_json[inner_package_json_values[i]] = template.package_json[inner_package_json_values[i]];
			}


		} else {

			package_json = default_values.default_sql_package_json;
			break;
			
		}
		
	}

	fs.writeFileSync(package_json_path, JSON.stringify(package_json, null, 2));

}