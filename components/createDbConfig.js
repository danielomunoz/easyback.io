const fs = require('fs');
const path = require('path');


exports.createDbConfig = () => {
	
	const db_config_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'config', 'db.config.js');

	fs.writeFileSync(db_config_path, returnDbConfig());
}

const returnDbConfig = () => {

/*
*

const constants = require("./constants");

module.exports = {
  HOST: constants.db_config.HOST,
  USER: constants.db_config.USER,
  PASSWORD: constants.db_config.PASSWORD,
  DB: constants.db_config.DB,
  dialect: constants.db_config.DIALECT
};

*
*/

return `const constants = require("./constants");\n\nmodule.exports = {\n  HOST: constants.db_config.HOST,\n  USER: constants.db_config.USER,\n  PASSWORD: constants.db_config.PASSWORD,\n  DB: constants.db_config.DB,\n  dialect: constants.db_config.DIALECT\n};`;

}