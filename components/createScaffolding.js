const fs = require('fs');
const path = require('path');


exports.createScaffolding = () => {
	
	const base_path = path.join(__dirname, '..', 'backends', 'backend');

	const readme_file_path = path.join(base_path, 'README.md');
	fs.writeFileSync(readme_file_path, '');

	const app_path = path.join(base_path, 'app');
	fs.mkdirSync(app_path);

	const config_path = path.join(app_path, 'config');
	fs.mkdirSync(config_path);

	const controllers_path = path.join(app_path, 'controllers');
	fs.mkdirSync(controllers_path);

	const middlewares_path = path.join(app_path, 'middlewares');
	fs.mkdirSync(middlewares_path);

	const errors_middlewares_path = path.join(middlewares_path, 'errors');
	fs.mkdirSync(errors_middlewares_path);

	const validation_middlewares_path = path.join(middlewares_path, 'validation');
	fs.mkdirSync(validation_middlewares_path);

	const resources_path = path.join(app_path, 'resources');
	fs.mkdirSync(resources_path);

	const models_path = path.join(app_path, 'models');
	fs.mkdirSync(models_path);

	const routes_path = path.join(app_path, 'routes');
	fs.mkdirSync(routes_path);

	const utils_path = path.join(app_path, 'utils');
	fs.mkdirSync(utils_path);

}