const fs = require('fs');
const path = require('path');


exports.createDbConfig = () => {
	
	const db_config_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'config', 'db.config.js');

	const db_config = `/*
* Sequelize package needs this configuration in order to establish connection with our database.
*/
const constants = require("./constants");

module.exports = {
  HOST: constants.db_config.HOST,
  USER: constants.db_config.USER,
  PASSWORD: constants.db_config.PASSWORD,
  DB: constants.db_config.DB,
  dialect: constants.db_config.DIALECT
};`;

	fs.writeFileSync(db_config_path, db_config);

}