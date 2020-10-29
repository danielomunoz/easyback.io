const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');
const { isUndefined, setVars } = require('../utils/utils.js');

exports.createControllers = (tables_object) => {

  let [ controllers_path, tables ] = setVars(path.join(__dirname, '..', 'backends', 'backend', 'app', 'controllers'), Object.keys(tables_object));

	tables.forEach( table => {
    let [ controller_path, controller_lines ] = setVars(path.join(controllers_path, `${table.toLowerCase()}.controller.js`), writeControllers(table, tables_object[table]));

		fs.writeFileSync(controller_path, returnController(table, controller_lines));
	});

}

const writeControllers = (table_name, table_object) => {

  let [ controller_lines, table_routes, table_fields, all_routes ] = setVars(``, table_object.routes, table_object.fields, Object.keys(table_object.routes));

  all_routes.forEach((route) => controller_lines += writeRoute(table_name, table_object, route) );

  let default_routes = Object.keys(default_values.default_routes);
  default_routes.forEach( default_route => {
    if(!all_routes.includes(default_route)) controller_lines += writeRoute(table_name, table_object, default_route);
  });

  return controller_lines;
}

const writeRoute = (table_name, table_object, route_name) => {
  let controller_lines = ``;

  // Escribimos apiDoc y cabecera
  controller_lines += writeApiDoc(table_name, table_object, route_name);
  controller_lines += `exports.${route_name} = async (req, res, next) => {\n\n  try{\n\n`;

  // Escribir controlador
  switch (route_name) {
    case 'create':
      controller_lines += returnCreateMethod(table_name, extractParams(table_object, 'create'), table_object.unique_fields);
      break;
    case 'update':
      controller_lines += returnUpdateMethod(table_name);
      break;
    case 'findAll':
      controller_lines += returnFindAllMethod(table_name);
      break;
    case 'findAllByCondition':
      controller_lines += findAllByConditionMethod(table_name);
      break;
    case 'findById':
      controller_lines += returnFindByIdMethod(table_name);
      break;
    case 'findByPattern':
      controller_lines += returnFindByPatternMethod(table_name);
      break;
    case 'deleteById':
      controller_lines += returnDeleteByIdMethod(table_name);
      break;
    case 'deleteAllByCondition':
      controller_lines += returnDeleteAllByConditionMethod(table_name);
      break;
  }

  // Escribimos bloque catch y cerramos ruta
  controller_lines += `\n\n  }catch(err){ next(err);\n\n};\n\n`;

  return controller_lines;
}

const extractParams = (table_object, route_name) => {
  if(!isUndefined(table_object.routes[route_name])){
    return Object.keys(table_object.routes[route_name].validation);
  } else {
    let params_list = [];
    Object.keys(table_object.fields).forEach(param => {
      if(param == 'id') return;
      params_list.push(param);
    });
    return params_list;
  }
}

const extractAllParamsAndValidationObject = (table_object, route_name) => {

  let all_params = extractParams(table_object, route_name);
  let validation_object = {};

  if(!isUndefined(table_object.routes[route_name])) {
    validation_object = table_object.routes[route_name].validation;
  } else {
    let default_validation_object = default_values.default_routes[route_name].validation;
    let default_validation_params = Object.keys(default_validation_object);
    default_validation_params.forEach( dvparam => {
      if(!all_params.includes(dvparam) && !dvparam.includes('all except')) {
        (dvparam == 'id') ? all_params.unshift(dvparam) : all_params.push(dvparam);
      }
    });
    all_params.forEach( this_param => {
      if(!isUndefined(default_validation_object[this_param])) { 
        validation_object[this_param] = default_validation_object[this_param];
        return;
      } else {
        default_validation_params.forEach( dvparam => {
          if(dvparam.includes('all except') && !dvparam.includes(this_param)) validation_object[this_param] = default_validation_object[dvparam];
        });
      }
    });
  }

  return [all_params, validation_object];
}

const writeApiDoc = (table_name, table_object, route_name) => {

  let [ api_doc_lines, my_param_api_doc_lines, all_params, validation_object ] = setVars(`/**\n* @api {${(!isUndefined(table_object.routes[route_name]) && !isUndefined(table_object.routes[route_name].method)) ? method = table_object.routes[route_name].method : method = default_values.default_routes[route_name].method}} /api/${table_name.toLowerCase()}${(!isUndefined(table_object.routes[route_name]) && !isUndefined(table_object.routes[route_name].route)) ? route = table_object.routes[route_name].route : route = default_values.default_routes[route_name].route}\n*\n`, ``, [], {});
  [ all_params, validation_object ] = extractAllParamsAndValidationObject(table_object, route_name);

  all_params.forEach((param) => {

    my_param_api_doc_lines = ``;
    
    if(isUndefined(validation_object[param])) return;

    validation_object[param].check.forEach((item, index) => {

      let my_param = ``;

      if(validation_object[param].check[index].join(' ').includes('not exists')) return;
      
      (validation_object[param].check[index].includes("optional")) ? my_param += `[${param}]` : my_param += param;

      if(validation_object[param].check[index].includes("isInt")){
        my_param_api_doc_lines += `* @apiParam {Number} ${my_param}\n`;
      } else if(validation_object[param].check[index].includes("isBoolean")) {
        my_param_api_doc_lines += `* @apiParam {Boolean} ${my_param}\n`;
      } else {
        my_param_api_doc_lines += `* @apiParam {String} ${my_param}\n`;
      }

    });

    api_doc_lines += my_param_api_doc_lines;
  });

  api_doc_lines += `*/\n`;

  return api_doc_lines;
}

const returnCreateMethod = (table_name, params_list, unique_fields) => {

/*
*

    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      manageBadRequests(req);
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Extract params from req.body.
    const { ${params_list} } = req.body;

    // Looking for an existing row of this ${table_name.toLowerCase()} on database.
    let query_${table_name.toLowerCase()} = await ${table_name}.findAll({ where: { [Op.or]: [${unique_params_list}] } });
    if(!isEmptyArray(query_${table_name.toLowerCase()})) throw createError(409, 'A ${table_name.toLowerCase()} with these ${unique_params_list} already exists on database');

    // Create ${table_name.toLowerCase()} object and database row.
    const ${table_name.toLowerCase()} = { ${params_list} };

    let data = await ${table_name}.create(${table_name.toLowerCase()});

    res.status(200).json(createResponse(200, 'Success creating a new ${table_name.toLowerCase()} on db', data));


*
*/
  params_list = params_list.join(', ');
  let controller_lines = `    // Validate params\n    const validation_errors = validationResult(req);\n\n    if (!validation_errors.isEmpty()) {\n      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());\n    }\n\n    // Extract params from req.body.\n    const { ${params_list} } = req.body;\n\n`;
  if(!isUndefined(unique_fields)){
    let unique_fields_string = ``;
    unique_fields.forEach( (u_field, index) => {
      unique_fields_string += `{ ${u_field} }`;
      if(index != unique_fields.length - 1) unique_fields_string += `, `;
    });
    controller_lines += `    // Looking for an existing row of this ${table_name.toLowerCase()} on database.\n    let query_${table_name.toLowerCase()} = await ${table_name}.findAll({ where: { [Op.or]: [ ${unique_fields_string} ] } });\n    if(!isEmptyArray(query_${table_name.toLowerCase()})) throw createError(409, 'A ${table_name.toLowerCase()} with these ${unique_fields_string} already exists on database');\n\n`;
  }
  controller_lines += `    // Create ${table_name.toLowerCase()} object and database row.\n    const ${table_name.toLowerCase()} = { ${params_list} };\n\n    let data = await ${table_name}.create(${table_name.toLowerCase()});\n\n    res.status(200).json(createResponse(200, 'Success creating a new ${table_name.toLowerCase()} on db', data));`;

  return controller_lines;
}

const returnUpdateMethod = (table_name) => {

/*
*

    // Looking for our ${table_name.toLowerCase()} and updating it.
    const id = req.params.id;

    let data = await ${table_name}.update(req.body, { where: { id } });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the ${table_name.toLowerCase()} id that you introduced');
    }
      
    res.status(200).json(createResponse(200, '${table_name} was successfully updated', null));

*
*/

  return `    // Looking for our ${table_name.toLowerCase()} and updating it.\n    const id = req.params.id;\n\n    let data = await ${table_name}.update(req.body, { where: { id } });\n\n    if(isEmptyArray(data)){\n      throw createError(404, 'There are not results on our database for the ${table_name.toLowerCase()} id that you introduced');\n    }  \n\n    res.status(200).json(createResponse(200, '${table_name} was successfully updated', null));`;

}

const returnFindAllMethod = (table_name) => {

/*
*

    // Create pagination values.
    let page = Number(req.query.page) || 1;
    let offset = Number(req.query.offset) || ((page - 1) * 20);
    let limit = Number(req.query.limit) || 20;

    // Listing from database.
    let data = await ${table_name}.findAll({ offset, limit });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the page that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()} list', data));

*
*/

  return `    // Create pagination values.\n    let page = Number(req.query.page) || 1;\n    let offset = Number(req.query.offset) || ((page - 1) * 20);\n    let limit = Number(req.query.limit) || 20;\n\n    // Listing from database.\n    let data = await ${table_name}.findAll({ offset, limit });\n\n    if(isEmptyArray(data)){\n      throw createError(404, 'There are not results on our database for the page that you introduced');\n    }    \n\n    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()} list', data));`;
}

const findAllByConditionMethod = (table_name) => {

/*
*

    // Create pagination values.
    let page = Number(req.body.page) || 1;
    let offset = Number(req.body.offset) || ((page - 1) * 20);
    let limit = Number(req.body.limit) || 20;
    let condition = req.body.condition;

    if(typeof condition !== 'object' || condition === null) {
      throw createError(400, 'The condition param must be an object');
    }

    Object.keys(condition).forEach( condition_field => {
      if(!Object.keys(${table_name}.rawAttributes).includes(condition_field)) {
        throw createError(400, 'The condition fields do not match the ${table_name.toLowerCase()} model fields');
      }
    });

    // Listing from database.
    let data = await ${table_name}.findAll({ offset, limit, where: condition });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the page that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()} list', data));

*
*/

  return `    // Create pagination values.\n    let page = Number(req.body.page) || 1;\n    let offset = Number(req.body.offset) || ((page - 1) * 20);\n    let limit = Number(req.body.limit) || 20;\n    let condition = req.body.condition;\n\n    if(typeof condition !== 'object' || condition === null) {\n      throw createError(400, 'The condition param must be an object');\n    }\n\n    Object.keys(condition).forEach( condition_field => {\n      if(!Object.keys(${table_name}.rawAttributes).includes(condition_field)) {\n        throw createError(400, 'The condition fields do not match the ${table_name.toLowerCase()} model fields');\n      }\n    });\n\n    // Listing from database.\n    let data = await ${table_name}.findAll({ offset, limit, where: condition });\n\n    if(isEmptyArray(data)){\n      throw createError(404, 'There are not results on our database for the page that you introduced');\n    }  \n\n    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()} list', data));`;
}

const returnFindByIdMethod = (table_name) => {

/*
*

    const id = req.params.id;

    let data = await ${table_name}.findByPk(id);

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the ${table_name.toLowerCase()} id that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()}', data));

*
*/

  return `    const id = req.params.id;\n\n    let data = await ${table_name}.findByPk(id);\n    if(isEmptyArray(data)){\n      throw createError(404, 'There are not results on our database for the ${table_name.toLowerCase()} id that you introduced');\n    }  \n\n    res.status(200).json(createResponse(200, 'Success retrieving ${table_name.toLowerCase()}', data));`;
}

const returnFindByPatternMethod = (table_name) => {

  return ``;
}

const returnDeleteByIdMethod = (table_name) => {

/*
*

    const id = req.params.id;

    let num = await ${table_name}.destroy({ where: { id } });

    if(num != 1){
      throw createError(404, `Cannot delete ${table_name.toLowerCase()} with id=${id}. Maybe ${table_name.toLowerCase()} was not found`);
    }
      
    res.status(200).json(createResponse(200, 'Success deleting ${table_name.toLowerCase()}', null));

*
*/

  return `    const id = req.params.id;\n\n    let num = await ${table_name}.destroy({ where: { id } });\n\n    if(num != 1){\n      throw createError(404, \`Cannot delete ${table_name.toLowerCase()} with id=\${id}. Maybe ${table_name.toLowerCase()} was not found\`);\n    }  \n\n    res.status(200).json(createResponse(200, 'Success deleting ${table_name.toLowerCase()}', null));`;
}

const returnDeleteAllByConditionMethod = (table_name) => {

/*
*

    // Extract pagination values.
    let condition = req.body.condition;

    if(typeof condition !== 'object' || condition === null) {
      throw createError(400, 'The condition param must be an object');
    }

    Object.keys(condition).forEach( condition_field => {
      if(!Object.keys(${table_name}.rawAttributes).includes(condition_field)) {
        throw createError(400, 'The condition fields do not match the ${table_name.toLowerCase()} model fields');
      }
    });

    // Deleting from database by condition.
    let num = await ${table_name}.destroy({ where: condition, truncate: false });
      
    res.status(200).json(createResponse(200, 'Deleted ${num} rows by condition', null));

*
*/

  return `    // Extract pagination values.\n    let condition = req.body.condition;\n\n    if(typeof condition !== 'object' || condition === null) {\n      throw createError(400, 'The condition param must be an object');\n    }\n\n    Object.keys(condition).forEach( condition_field => {\n      if(!Object.keys(${table_name}.rawAttributes).includes(condition_field)) {\n        throw createError(400, 'The condition fields do not match the ${table_name.toLowerCase()} model fields');\n      }\n    });\n\n    // Deleting from database by condition.\n    let num = await ${table_name}.destroy({ where: condition, truncate: false });  \n\n    res.status(200).json(createResponse(200, \`Deleted \${num} rows by condition\`, null));`;
}

const returnController = (table, controller_lines) => {

/*
*

// Sequelize imports to interact with database.
const db = require("../models");
const ${table} = db.${table.toLowerCase()};
const Op = db.Sequelize.Op;

// Importing external and core packages
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Importing own packages
const cnsts = require("../config/constants");
const { manageBadRequests, createError, createResponse, isEmptyArray } = require("../utils/utils");



${controller_lines}

*
*/

  return `// Sequelize imports to interact with database.\nconst db = require("../models");\nconst ${table} = db.${table.toLowerCase()};\nconst Op = db.Sequelize.Op;\n\n// Importing external and core packages\nconst crypto = require('crypto');\nconst { validationResult } = require('express-validator');\n\n// Importing own packages\nconst cnsts = require("../config/constants");\nconst { manageBadRequests, createError, createResponse, isEmptyArray } = require("../utils/utils");\n\n\n\n${controller_lines}`;
}

/*
* Otros métodos que incluir:

// Encontrar tablas por patrón en un determinado campo
    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Searching on database for the company that contains our pattern inside its description.
    let sql_query_pattern = '%' + req.params.pattern + '%';

    let data = await Company.findAll({ where: { [field]: { [Op.like]: sql_query_pattern } } });
      
    res.status(200).json(createResponse(200, 'Success retrieving companies by pattern', data));

*
*/