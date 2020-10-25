const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');
const { isUndefined, setVars } = require('../utils/utils.js');


exports.createModels = (tables_object) => {

	let [ models_path, models_files_on_index, tables ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'app', 'models'), ``, Object.keys(tables_object));

	tables.forEach( table => {

	  let [ model_path, model_fields, fields ] = setVars(path.join(models_path, `${table.toLowerCase()}.model.js`), `\n    `, Object.keys(tables_object[table].fields));

	  models_files_on_index += `db.${table.toLowerCase()} = require("./${table.toLowerCase()}.model.js")(sequelize, Sequelize);\n`;

	  fields.forEach( (field, index) => {

		if(field == 'id') return;

		model_fields += `${field}: { type: Sequelize.${default_values.sql2sequelize[tables_object[table].fields[field].type]}`;

		if(!isUndefined(tables_object[table].fields[field].range)){
			model_fields += `(${tables_object[table].fields[field].range})`;
		}

		if(!isUndefined(tables_object[table].unique_fields)) {
			if(tables_object[table].unique_fields.includes(field)) {
				model_fields += `, unique: true },`;
			} else {
				model_fields += ` },`;
			}
		} else {
			model_fields += ` },`;
		}

		// Si vamos por el último campo del modelo, quitamos la coma final pues el modelo es
		// un objeto, y el último campo de un objeto nunca lleva coma.
		if(index == fields.length - 1) {
			model_fields = model_fields.slice(0, -1);
		}

		model_fields += `\n    `;

	  });

	  let model = returnModelFile(table, model_fields);

	  fs.writeFileSync(model_path, model);
	
	});

	let index_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'models', 'index.js');

	let index = returnIndexFile(models_files_on_index);

	fs.writeFileSync(index_path, index);
}

const returnModelFile = (table, model_fields) => {

/*
*

// This is the model of ${table} table on database.

module.exports = (sequelize, Sequelize) => {

  const ${table} = sequelize.define("${table}", {
    ${model_fields}
  });

  return ${table};
};

*
*/

return `// This is the model of ${table} table on database.\n\nmodule.exports = (sequelize, Sequelize) => {\n\n  const ${table} = sequelize.define("${table}", {\n    ${model_fields}\n  });\n\n  return ${table};\n};`;

}

const returnIndexFile = (models_files_on_index) => {

/*
*

// This is the file needed by Sequelize to establish connection with database and to load the models of
// tables that our database contains. We will require this file into server, controllers and middlewares
// in order to interact with our tables on database using Sequelize.
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

*
*/

return `// This is the file needed by Sequelize to establish connection with database and to load the models of\n// tables that our database contains. We will require this file into server, controllers and middlewares\n// in order to interact with our tables on database using Sequelize.\nconst dbConfig = require("../config/db.config.js");\n\nconst Sequelize = require("sequelize");\nconst sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {\n  host: dbConfig.HOST,\n  dialect: dbConfig.dialect\n});\n\nconst db = {};\n\ndb.Sequelize = Sequelize;\ndb.sequelize = sequelize;\n\n${models_files_on_index}\nmodule.exports = db;`;

}