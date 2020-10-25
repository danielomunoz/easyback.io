const fs = require('fs');
const path = require('path');


exports.createConstantsFile = (db_object) => {

	const constants_file_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'config', 'constants.js');

	fs.writeFileSync(constants_file_path, returnConstantsFile(db_object.host, db_object.user, db_object.password, db_object.name, db_object.dialect));
}

const returnConstantsFile = (host, user, password, name, dialect) => {

/*
*

module.exports = {
	db_config: {
		HOST: "${host}",
  		USER: "${user}",
  		PASSWORD: "${password}",
  		DB: "${name}",
  		DIALECT: "${dialect}"
	},
	http_codes:{
		OK: 200,
		BAD_REQUEST: 400,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		INTERNAL_SERVER_ERROR: 500,
		ALREADY_EXISTS: 409
	}
}

*
*/

return `module.exports = {\n    db_config: {\n        HOST: "${host}",\n         USER: "${user}",\n        PASSWORD: "${password}",\n        DB: "${name}",\n        DIALECT: "${dialect}"\n    },\n    http_codes:{\n        OK: 200,\n        BAD_REQUEST: 400,\n        FORBIDDEN: 403,\n        NOT_FOUND: 404,\n        INTERNAL_SERVER_ERROR: 500,\n        ALREADY_EXISTS: 409\n    }\n}`;

}