const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');

// CUIDADO SI EL ÚLTIMO PARÁMETRO A VALIDAR ES UN PARÁMETRO MÚLTIPLE!!!!!! NO PONE BIEN LOS BARRA N
exports.createValidationMiddlewares = (template) => {
	const validation_middlewares_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'middlewares', 'validation');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){

		let validation_middleware_file_path = path.join(validation_middlewares_path, `${tables[i].toLowerCase()}.validation.middlewares.js`);

		let validation_case = ``;

		let default_routes = Object.keys(default_values.default_routes);

		let my_tables_routes = Object.keys(template.db.tables[tables[i]].routes);

		for(j=0; j<my_tables_routes.length; j++){
			validation_case += `case '${my_tables_routes[j]}': {\n      return [\n        `;

			validation_params = Object.keys(template.db.tables[tables[i]].routes[my_tables_routes[j]].validation);
			for(k=0; k<validation_params.length; k++){

				if(Array.isArray(template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].where)){
					for(aux=0; aux<template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].where.length; aux++){
						validation_case += `${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].where[aux]}('${validation_params[k]}', '${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].text[aux]}')`;

						let validation_methods = template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].check[aux];
						for(l=0; l<validation_methods.length; l++){
							validation_case += `.${validation_methods[l]}()`;
						}

						if(template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].custom !== undefined){
							validation_case += `.custom((value, { req }) => {\n          let re = ${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].custom[aux]};\n          if (!re.test(value)) {\n            throw new Error('${validation_params[k]} must match the custom pattern');\n          }\n\n          return true;\n        })`;
						}

						validation_case += `,\n        `;

						if(k == validation_params.length - 1) {
							validation_case = validation_case.slice(0, -10);
						}
					}
				} else {

					validation_case += `${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].where}('${validation_params[k]}', '${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].text}')`;

					let validation_methods = template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].check;
					for(l=0; l<validation_methods.length; l++){
						validation_case += `.${validation_methods[l]}()`;
					}

					if(template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].custom !== undefined){
						validation_case += `.custom((value, { req }) => {\n          let re = ${template.db.tables[tables[i]].routes[my_tables_routes[j]].validation[validation_params[k]].custom};\n          if (!re.test(value)) {\n            throw new Error('${validation_params[k]} must match the custom pattern');\n          }\n\n          return true;\n        })`;
					}

					validation_case += `,\n        `;

					if(k == validation_params.length - 1) {
						validation_case = validation_case.slice(0, -10);
					}
				}
			}

			
			validation_case += '\n      ]\n    }\n    ';
		}

		for(m=0; m<default_routes.length; m++){
			if(template.db.tables[tables[i]].routes[default_routes[m]] === undefined){

				validation_case += `case '${default_routes[m]}': {\n      return [\n        `;
				
				let all_validation_params = Object.keys(template.db.tables[tables[i]].fields);

				let validation_default_params = Object.keys(default_values.default_routes[default_routes[m]].validation);

				for(n=0; n<validation_default_params.length; n++){

					if(validation_default_params[n].includes("all except")){
						for(p=0; p<all_validation_params.length; p++){
							if(!validation_default_params[n].includes(all_validation_params[p])){
								//Construímos ruta
								validation_case += `${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where}('${all_validation_params[p]}', '${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].text}${all_validation_params[p]}')`;

								let validation_methods = default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].check;
								for(l=0; l<validation_methods.length; l++){
									validation_case += `.${validation_methods[l]}()`;
								}

								if(p != all_validation_params.length - 1 || (p == all_validation_params.length - 1 && n != validation_default_params.length - 1)) validation_case += `,\n        `;
								// fin ruta
							}
						}
					} else {

						// Construímos ruta
						if(Array.isArray(default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where)){

							for(aux=0; aux<default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where.length; aux++){

								validation_case += `${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where[aux]}('${validation_default_params[n]}', '${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].text[aux]}')`;

								let validation_methods = default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].check[aux];
								for(l=0; l<validation_methods.length; l++){
									validation_case += `.${validation_methods[l]}()`;
								}

								if(n != validation_default_params.length - 1 || (n == validation_default_params.length - 1 && aux != default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where.length - 1)) validation_case += `,\n        `;

							}

						} else {

							validation_case += `${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].where}('${validation_default_params[n]}', '${default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].text}')`;

							let validation_methods = default_values.default_routes[default_routes[m]].validation[validation_default_params[n]].check;
							for(l=0; l<validation_methods.length; l++){
								validation_case += `.${validation_methods[l]}()`;
							}

							if(n != validation_default_params.length - 1) validation_case += `,\n        `;

						}
						// fin ruta

					}

				}

				validation_case += '\n      ]\n    }\n    ';
			}
		}

		let validation_middleware = `/*
* This is the validate function of ${tables[i]} controller. It follows the syntax of express-validator to check
* that body, params and queries are well-formed. And return an error otherwise.
*/
const { body, query, param } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    ${validation_case}
  }
}`;

		fs.writeFileSync(validation_middleware_file_path, validation_middleware);
	}
}