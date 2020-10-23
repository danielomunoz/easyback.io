const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');

// CUIDADO SI EL ÚLTIMO PARÁMETRO A VALIDAR ES UN PARÁMETRO MÚLTIPLE!!!!!! NO PONE BIEN LOS BARRA N
exports.createValidationMiddlewares = (template) => {
	const validation_middlewares_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'middlewares', 'validation');

	let tables = Object.keys(template.db.tables);

	tables.forEach( table => {

	  let validation_middleware_file_path = path.join(validation_middlewares_path, `${table.toLowerCase()}.validation.middlewares.js`);

   	  let validation_case = ``;

	  let default_routes = Object.keys(default_values.default_routes);

	  let my_table_routes = Object.keys(template.db.tables[table].routes);

	  // Escribimos la validación de las rutas de nuestra plantilla
	  my_table_routes.forEach( my_route => {

	  	  validation_case += `case '${my_route}': {\n      return [\n        `;

		  validation_params = Object.keys(template.db.tables[table].routes[my_route].validation);
		  validation_params.forEach( (val_param, k) => {

			  if(Array.isArray(template.db.tables[table].routes[my_route].validation[val_param].where)){
				  for(aux=0; aux<template.db.tables[table].routes[my_route].validation[val_param].where.length; aux++){
					  validation_case += `${template.db.tables[table].routes[my_route].validation[val_param].where[aux]}('${val_param}', '${template.db.tables[table].routes[my_route].validation[val_param].text[aux]}')`;

					  let validation_methods = template.db.tables[table].routes[my_route].validation[val_param].check[aux];
					  for(l=0; l<validation_methods.length; l++){
						  validation_case += `.${validation_methods[l]}()`;
					  }

					  if(template.db.tables[table].routes[my_route].validation[val_param].custom !== undefined){
						  validation_case += `.custom((value, { req }) => {\n          let re = ${template.db.tables[table].routes[my_route].validation[val_param].custom[aux]};\n          if (!re.test(value)) {\n            throw new Error('${val_param} must match the custom pattern');\n          }\n\n          return true;\n        })`;
					  }

					  validation_case += `,\n        `;

					  if(k == validation_params.length - 1) {
						  validation_case = validation_case.slice(0, -10);
					  }
				  }
			  } else {

				  validation_case += `${template.db.tables[table].routes[my_route].validation[val_param].where}('${val_param}', '${template.db.tables[table].routes[my_route].validation[val_param].text}')`;

				  let validation_methods = template.db.tables[table].routes[my_route].validation[val_param].check;
				  for(l=0; l<validation_methods.length; l++){
					  validation_case += `.${validation_methods[l]}()`;
				  }

				  if(template.db.tables[table].routes[my_route].validation[val_param].custom !== undefined){
					  validation_case += `.custom((value, { req }) => {\n          let re = ${template.db.tables[table].routes[my_route].validation[val_param].custom};\n          if (!re.test(value)) {\n            throw new Error('${val_param} must match the custom pattern');\n          }\n\n          return true;\n        })`;
				  }

				  validation_case += `,\n        `;

				  if(k == validation_params.length - 1) {
					  validation_case = validation_case.slice(0, -10);
				  }
			  }
		  });

		
	  validation_case += '\n      ]\n    }\n    ';

	});

	// Escribimos la validación de las rutas por defecto
	default_routes.forEach( default_route => {
	  if(template.db.tables[table].routes[default_route] === undefined){

		  validation_case += `case '${default_route}': {\n      return [\n        `;
			
		  let all_validation_params = Object.keys(template.db.tables[table].fields);
		  let validation_default_params = Object.keys(default_values.default_routes[default_route].validation);
		  validation_default_params.forEach( (vd_param, n) => {
			  if(vd_param.includes("all except")){
				  for(p=0; p<all_validation_params.length; p++){
					  if(!vd_param.includes(all_validation_params[p])){
						//Construímos ruta
						validation_case += `${default_values.default_routes[default_route].validation[vd_param].where}('${all_validation_params[p]}', '${default_values.default_routes[default_route].validation[vd_param].text}${all_validation_params[p]}')`;

						let validation_methods = default_values.default_routes[default_route].validation[vd_param].check;
						for(l=0; l<validation_methods.length; l++){
							validation_case += `.${validation_methods[l]}()`;
						}

						if(p != all_validation_params.length - 1 || (p == all_validation_params.length - 1 && n != validation_default_params.length - 1)) validation_case += `,\n        `;
						// fin ruta
					  }
				  }
			  } else {
				  // Construímos ruta
			      if(Array.isArray(default_values.default_routes[default_route].validation[vd_param].where)){

					for(aux=0; aux<default_values.default_routes[default_route].validation[vd_param].where.length; aux++){

					  validation_case += `${default_values.default_routes[default_route].validation[vd_param].where[aux]}('${vd_param}', '${default_values.default_routes[default_route].validation[vd_param].text[aux]}')`;

					  let validation_methods = default_values.default_routes[default_route].validation[vd_param].check[aux];
					  for(l=0; l<validation_methods.length; l++){
						validation_case += `.${validation_methods[l]}()`;
					  }

					  if(n != validation_default_params.length - 1 || (n == validation_default_params.length - 1 && aux != default_values.default_routes[default_route].validation[vd_param].where.length - 1)) validation_case += `,\n        `;

					}

				  } else {

					validation_case += `${default_values.default_routes[default_route].validation[vd_param].where}('${vd_param}', '${default_values.default_routes[default_route].validation[vd_param].text}')`;

					let validation_methods = default_values.default_routes[default_route].validation[vd_param].check;
					for(l=0; l<validation_methods.length; l++){
						validation_case += `.${validation_methods[l]}()`;
					}

					if(n != validation_default_params.length - 1) validation_case += `,\n        `;

				  }
				  // fin ruta

			  }

			});

		  validation_case += '\n      ]\n    }\n    ';
		}
	});

		let validation_middleware = `/*
* This is the validate function of ${table} controller. It follows the syntax of express-validator to check
* that body, params and queries are well-formed. And return an error otherwise.
*/
const { body, query, param } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    ${validation_case}
  }
}`;

		fs.writeFileSync(validation_middleware_file_path, validation_middleware);
	});
}