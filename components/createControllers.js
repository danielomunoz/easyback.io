const fs = require('fs');
const path = require('path');


// HAY QUE TERMINAR EL TEMA DE LOS PARÁMETROS DE VALIDACIÓN Y LOS PARÁMETROS EN GENERAL!!!!!!
exports.createControllers = (template) => {
	
	const controllers_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'controllers');

	let tables = Object.keys(template.db.tables);

	for(i=0; i<tables.length; i++){
		let controller_path = path.join(controllers_path, `${tables[i].toLowerCase()}.controller.js`);

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

/**
* @api {post} /api/companies
*
* @apiParam {String} name
* @apiParam {String} cif
* @apiParam {String} email
* @apiParam {String} description
* @apiParam {String} logo
* @apiParam {String} [shortdesc]
* @apiParam {String} [ccc]
* @apiParam {String} [date]
* @apiParam {Boolean} [status]
*/
exports.create = async (req, res, next) => {

  try{

    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      manageBadRequests(req);
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Extract params from req.body.
    const { name, description, email, cif, logo, shortdesc, ccc, date, status} = req.body;

    // Looking for an existing row of this company on database.
    let query_company = await Company.findAll({ where: { [Op.or]: [{ cif }, { name }] } });
    if(!isEmptyArray(query_company)) throw createError(409, 'A company with this CIF or name already exists on database');

    // Create company object and database row.
    const company = { name, description, email, cif, logo, shortdesc, ccc, date, status,
                      token: crypto.createHash(cnsts.controllers.company.HASH_ALGORITHM).update(req.body.name + req.body.cif + new Date().getMilliseconds()).digest(cnsts.controllers.company.DIGEST)
    };

    let data = await Company.create(company);

    res.status(200).json(createResponse(200, 'Success creating a new company on db', data));

  }catch(err){ next(err); }

};

/**
* @api {put} /api/companies/:id
*
* @apiParam {Number} id Company unique ID.
*
* @apiParam {String} [name]
* @apiParam {String} [cif]
* @apiParam {String} [email]
* @apiParam {String} [description]
* @apiParam {String} [logo]
* @apiParam {String} [shortdesc]
* @apiParam {String} [ccc]
* @apiParam {String} [date]
* @apiParam {Boolean} [status]
*/
exports.update = async (req, res, next) => {

  try{

    // Looking for our company and updating it.
    const id = req.params.id;

    let data = await Company.update(req.body, { where: { id: id } });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the company id that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Company was successfully updated', null));

  }catch(err){ next(err); }

};

/**
* @api {get} /api/companies
*
* @apiParam {Number} [page]
*/
exports.findAll = async (req, res, next) => {

  try{

    // Create pagination values.
    let page = Number(req.query.page) || cnsts.controllers.company.MIN_PAGE;
    let offset = (page - cnsts.controllers.company.MIN_PAGE) * cnsts.controllers.company.OFFSET_PAGINATION_FACTOR;
    let limit = cnsts.controllers.company.DEFAULT_LIMIT;

    // Listing companies.
    let data = await Company.findAll({ offset, limit, attributes: [ 'id', 'name', 'shortdesc', 'description', 'email', 'date', 'status', 'logo'] });

    if(isEmptyArray(data)){
      throw createError(404, 'There are not results on our database for the page that you introduced');
    }
      
    res.status(200).json(createResponse(200, 'Success retrieving companies list', data));

  }catch(err){ next(err); }

};

/**
* @api {get} /api/companies/:pattern
*
* @apiParam {String} pattern included on the description of a company.
*/
exports.search = async (req, res, next) => {

  try{

    // Validate params and manage bad requests (creating a blacklist for the possible hackers).
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      manageBadRequests(req);
      throw createError(400, 'Bad requests. Params are needed in their correct format', validation_errors.array());
    }

    // Searching on database for the company that contains our pattern inside its description.
    let sql_query_pattern = '%' + req.params.pattern + '%';

    let data = await Company.findAll({ where: { description: { [Op.like]: sql_query_pattern } }, 
                                       attributes: [ 'id', 'name', 'shortdesc', 'description', 'email', 'date', 'status', 'logo'] });
      
    res.status(200).json(createResponse(200, 'Success retrieving companies by pattern', data));

  }catch(err){ next(err); }

};`;

		fs.writeFileSync(controller_path, controller);

	}

}