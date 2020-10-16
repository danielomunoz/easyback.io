const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');


exports.createModels = (template) => {
	const models_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'models');

	let models_files_on_index = "";
	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){

		let model_path = path.join(models_path, `${tables[i].toLowerCase()}.model.js`);

		models_files_on_index += `db.${tables[i].toLowerCase()} = require("./${tables[i].toLowerCase()}.model.js")(sequelize, Sequelize);\n`;

		let model_fields = `\n    `;

		let fields = Object.keys(template.db.tables[tables[i]].fields);

		for(j=0; j<fields.length; j++){

			if(fields[j] != 'id'){

				model_fields += `${fields[j]}: { type: Sequelize.${default_values.sql2sequelize[template.db.tables[tables[i]].fields[fields[j]].type]}`;

				if(template.db.tables[tables[i]].fields[fields[j]].range !== undefined){
					model_fields += `(${template.db.tables[tables[i]].fields[fields[j]].range})`;
				}

				if(template.db.tables[tables[i]].unique_fields !== undefined) {
					if(template.db.tables[tables[i]].unique_fields.includes(fields[j])) {
						model_fields += `, unique: true },`;
					} else {
						model_fields += ` },`;
					}
				} else {
					model_fields += ` },`;
				}

				// Si vamos por el último campo del modelo, quitamos la coma final pues el modelo es
				// un objeto, y el último campo de un objeto nunca lleva coma.
				if(j == fields.length - 1) {
					model_fields = model_fields.slice(0, -1);
				}

				model_fields += `\n    `;

			}

		}

		let model = `/*
* This is the model of ${tables[i]} table on database.
*/
module.exports = (sequelize, Sequelize) => {

  const ${tables[i]} = sequelize.define("${tables[i]}", {
    ${model_fields}
  });

  return ${tables[i]};
};`;

		fs.writeFileSync(model_path, model);

	}

	let index_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'models', 'index.js');

	let index = `/*
* This is the file needed by Sequelize to establish connection with database and to load the models of
* tables that our database contains. We will require this file into server, controllers and middlewares
* in order to interact with our tables on database using Sequelize.
*/
const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

${models_files_on_index}
module.exports = db;
`;

	fs.writeFileSync(index_path, index);
}