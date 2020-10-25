const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');
const { setVars, isUndefined } = require('../utils/utils.js');


exports.createValidationMiddlewares = (tables_object) => {

	let [ validation_middlewares_path, tables ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'app', 'middlewares', 'validation'), Object.keys(tables_object));

	tables.forEach( table => {

	  let [ validation_middleware_file_path, validation_lines, default_routes, custom_routes ] = setVars(path.join(validation_middlewares_path, `${table.toLowerCase()}.validation.middlewares.js`), ``, Object.keys(default_values.default_routes), Object.keys(tables_object[table].routes));

	  // Escribimos la validación de las rutas de nuestra plantilla
	  custom_routes.forEach( custom_route => {
	  	validation_lines += `case '${custom_route}': {\n      return [\n        `;
		validation_params = Object.keys(tables_object[table].routes[custom_route].validation);
		
		validation_params.forEach((validation_param, index) => validation_lines += writeValidationLines(tables_object[table].routes, custom_route, validation_param, validation_params.length, index));
		
	    validation_lines += '\n      ]\n    }\n    ';
	  });

	  // Escribimos la validación de las rutas por defecto
	  default_routes.forEach( default_route => {
	    if(isUndefined(tables_object[table].routes[default_route])){

		  validation_lines += `case '${default_route}': {\n      return [\n        `;
			
		  let [ all_validation_params, validation_default_params ] = setVars(Object.keys(tables_object[table].fields), Object.keys(default_values.default_routes[default_route].validation));

		  validation_default_params.forEach( (vd_default_param, i) => {
			if(vd_default_param.includes("all except")){
			  all_validation_params.forEach( (this_validation_param, j) => {
			  	if(!vd_default_param.includes(this_validation_param)){
			  		validation_lines += writeValidationLines(default_values.default_routes, default_route, this_validation_param, all_validation_params.length, j);
			  	}
			  });
			} else {
			  validation_lines += writeValidationLines(default_values.default_routes, default_route, vd_default_param, validation_default_params.length, i);
			}
		  });

		  validation_lines += '\n      ]\n    }\n    ';
		}
	  });

	  fs.writeFileSync(validation_middleware_file_path, returnValidationMiddleware(table, validation_lines));
	});
}

const writeValidationLines = (routes_object, route_name, validation_param, global_params_length, global_index) => {
  let validation_lines = ``;
  let validation_object;

  let more_lines_condition = false;

  // Definimos el objeto de validación. Este paso es necesario porque el parámetro de validación puede
  // ser contenido dentro del 'all except' de la ruta, en cuyo caso no es trivial obtener dicho objeto,
  // ni poner las comas y los \n del final de línea
  if(!isUndefined(routes_object[route_name].validation[validation_param])){
  	validation_object = routes_object[route_name].validation[validation_param];
  } else {
  	let validation_keys = Object.keys(routes_object[route_name].validation);
  	validation_keys.forEach( val_param => {
  	  if(val_param.includes('all except')) {
  	  	validation_object = routes_object[route_name].validation[val_param];
  	  	more_lines_condition = true;
  	  }
  	});
  }

  // Escribimos las líneas para cada parámetro de validación (pudiendo éste ser múltiple)
  validation_object.where.forEach( (_, index) => {
    validation_lines += `${validation_object.where[index]}('${validation_param}', '${(!isUndefined(validation_object.text)) ? validation_object.text[index] : `Invalid ${validation_param}`}')`;

    let validation_methods = validation_object.check[index];
    validation_methods.forEach( validation_method => validation_lines += `.${validation_method}()`);

    if(!isUndefined(validation_object.custom)) validation_lines += `.custom((value, { req }) => {\n          let re = ${validation_object.custom[index]};\n          if (!re.test(value)) {\n            throw new Error('${validation_param} must match the custom pattern');\n          }\n\n          return true;\n        })`;

    if(global_index != global_params_length - 1 || (global_index == global_params_length - 1 && index != validation_object.where.length - 1) || more_lines_condition) validation_lines += `,\n        `;
  });

  return validation_lines;
}

const returnValidationMiddleware = (table, validation_lines) => {

/*
*

// This is the validate function of ${table} controller. It follows the syntax of express-validator to check
// that body, params and queries are well-formed. And return an error otherwise.

const { body, query, param } = require('express-validator');

exports.validate = (method) => {
  switch (method) {
    ${validation_lines}
  }
}

*
*/

return `// This is the validate function of ${table} controller. It follows the syntax of express-validator to check\n// that body, params and queries are well-formed. And return an error otherwise.\n\nconst { body, query, param } = require('express-validator');\n\nexports.validate = (method) => {\n  switch (method) {\n    ${validation_lines}\n  }\n}`;

}