const fs = require('fs');
const path = require('path');

exports.readTemplate = () => {
	const template_path = path.join(__dirname, '..', '/templates/template.json');
	
	const template_raw = fs.readFileSync(template_path);
	const template = JSON.parse(template_raw);

	return template;
}

exports.clearBackendFolder = async () => {
	const backend_path = path.join(__dirname, '..', '/backends/backend');

	if(fs.existsSync(backend_path)) fs.rmdirSync(backend_path, { recursive: true });

	await sleep(500);
	
	fs.mkdirSync(backend_path);
}

const sleep = (ms)  => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}