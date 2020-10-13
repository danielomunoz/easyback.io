const fs = require('fs');
const path = require('path');


exports.createConstantsFile = (template) => {

	const constants_file_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'config', 'constants.js');

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