const fs = require('fs');
const path = require('path');

const default_values = require('../utils/utils.json');

exports.createControllers = (template) => {
	
	const controllers_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'controllers');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let controller_path = path.join(controllers_path, `${tables[i].toLowerCase()}.controller.js`);

    let controller_lines = ``;

    controller_lines = writeControllers(template.db.tables[tables[i]].routes, tables[i], template.db.tables[tables[i]].fields);

		let controller = `// Sequelize imports to interact with database.
const db = require("../models");
const ${tables[i]} = db.${tables[i].toLowerCase()};
const Op = db.Sequelize.Op;

// Importing external and core packages
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Importing own packages
const cnsts = require("../config/constants");
const { manageBadRequests, createError, createResponse, isEmptyArray } = require("../utils/utils");



${controller_lines}`;

		fs.writeFileSync(controller_path, controller);

	}

}

const writeControllers = (routes, table_name, table_fields) => {

  let controller_lines = ``;

  let all_routes = Object.keys(routes);

  all_routes.forEach((route) => {
    controller_lines += writeApiDoc(routes[route], table_name);
    controller_lines += `exports.${route} = async (req, res, next) => {\n\n  try{\n\n`;

    const route_steps = Object.keys(routes[route].steps);
    route_steps.forEach((item) => {
      controller_lines += writeStep(routes[route].steps[item]);
    });

    controller_lines += `\n\n  }catch(err){ next(err);\n\n};\n\n`;
  });

  let default_routes = Object.keys(default_values.default_routes);
  default_routes.forEach( default_route => {
    if(!all_routes.includes(default_route)){

      let default_route_object = default_values.default_routes[default_route];
      let fields = Object.keys(table_fields);
      let default_route_object_validation_fields = Object.keys(default_route_object.validation);

      fields.forEach( (field, index) => {
        default_route_object_validation_fields.forEach( drovf => {
          if(drovf.includes("all except")){
            if(!drovf.includes(field)){
              default_route_object.validation[field] = default_route_object.validation[drovf];
              default_route_object.validation[field].text = `Invalid ${field}`;
            }

            if(index == fields.length - 1) delete default_route_object.validation[drovf];
          }
        });
      });

      controller_lines += writeApiDoc(default_route_object, table_name);
      controller_lines += `exports.${default_route} = async (req, res, next) => {\n\n  try{\n\n`;

      const route_steps = Object.keys(default_values.default_routes[default_route].steps);
      route_steps.forEach((item) => {
        controller_lines += writeStep(default_values.default_routes[default_route].steps[item]);
      });

      controller_lines += `\n\n  }catch(err){ next(err);\n\n};\n\n`;
    }
  });

  return controller_lines;
}

const writeApiDoc = (route, table_name) => {

  let api_doc_lines = `/**\n* @api {${route.method}} /api/${table_name.toLowerCase()}${route.route}\n*\n`;
  let my_param_api_doc_lines = ``;

  const validation_object = route.validation;
  
  let all_params = Object.keys(validation_object);

  all_params.forEach((param) => {

    if(Array.isArray(validation_object[param].where)){

      validation_object[param].check.forEach((item, index) => {

        let my_param = ``;

        if(validation_object[param].check[index].join(' ').includes('not exists')){
          return;
        } else if(validation_object[param].check[index].includes("optional")) {
          my_param += `[${param}]`;
        } else {
          my_param += param;
        }

        my_param_api_doc_lines = ``;

        if(validation_object[param].check[index].includes("isInt")){
          my_param_api_doc_lines += `* @apiParam {Number} ${my_param}\n`;
        } else if(validation_object[param].check[index].includes("isBoolean")) {
          my_param_api_doc_lines += `* @apiParam {Boolean} ${my_param}\n`;
        } else {
          my_param_api_doc_lines += `* @apiParam {String} ${my_param}\n`;
        }

      }); 

    } else {

      let my_param = ``;

      if(validation_object[param].check.join(' ').includes('not exists')){
        return;
      } else if(validation_object[param].check.includes("optional")) {
        my_param += `[${param}]`;
      } else {
        my_param += param;
      }

      my_param_api_doc_lines = ``;

      if(validation_object[param].check.includes("isInt")){
        my_param_api_doc_lines += `* @apiParam {Number} ${my_param}\n`;
      } else if(validation_object[param].check.includes("isBoolean")) {
        my_param_api_doc_lines += `* @apiParam {Boolean} ${my_param}\n`;
      } else {
        my_param_api_doc_lines += `* @apiParam {String} ${my_param}\n`;
      }

    }

    api_doc_lines += my_param_api_doc_lines;
  });

  api_doc_lines += `*/\n`;

  return api_doc_lines;
}

const writeStep = (step) => {
  let step_lines = ``;

  switch (step) {
    case 'validate':
      step_lines += `    // Validate params and manage bad requests (creating a blacklist for the possible hackers).\n    const validation_errors = validationResult(req);\n\n    if (!validation_errors.isEmpty()) {\n      throw createError(400, 'Bad requests. Input params are needed in their correct format', validation_errors.array());\n    }\n\n`;
      break;
    default:
      step_lines += ``;
  }

  return step_lines;
}