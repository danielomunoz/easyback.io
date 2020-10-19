const fs = require('fs');
const path = require('path');

const utils = require('./utils/utils.js');

const { createMongoPackageJsonAndServer } = require('./components/createMongoPackageJsonAndServer');
const { createSqlPackageJsonAndServer } = require('./components/createSqlPackageJsonAndServer');
const { createScaffolding } = require('./components/createScaffolding');
const { createServer } = require('./components/createServer');
const { createConstantsFile } = require('./components/createConstantsFile');
const { createDbConfig } = require('./components/createDbConfig');
const { createControllers } = require('./components/createControllers');
const { createErrorsMiddlewares } = require('./components/createErrorsMiddlewares');
const { createValidationMiddlewares } = require('./components/createValidationMiddlewares');
const { createModels } = require('./components/createModels');
const { createRoutes } = require('./components/createRoutes');
const { createUtilsFile } = require('./components/createUtilsFile');



const createBackend = async () => {

	const template = utils.readTemplate();

	await utils.clearBackendFolder();

	if(template.global.db_type == "sql"){
		createSqlPackageJsonAndServer(template);
	} else {
		createMongoPackageJsonAndServer(template);
	}
	
	createScaffolding();

	createServer(template);

	createConstantsFile(template.db);

	createDbConfig();

	createControllers(template);

	createErrorsMiddlewares();

	createValidationMiddlewares(template);

	createModels(template);

	createRoutes(template);

	createUtilsFile();

}

createBackend();