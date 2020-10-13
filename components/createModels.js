const fs = require('fs');
const path = require('path');


// TERMINAR!!!!!!
exports.createModels = (template) => {
	const models_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'models');

	let model_in_index = "";
	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let model_path = path.join(models_path, `${tables[i].toLowerCase()}.model.js`);

		let model = ``;

		fs.writeFileSync(model_path, model);
	}
}