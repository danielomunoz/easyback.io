const fs = require('fs');
const path = require('path');


exports.createUtilsFile = () => {
	
	const utils_file_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'utils', 'utils.js');

	const utils_file = returnUtilsFile();

	fs.writeFileSync(utils_file_path, utils_file);

}

const returnUtilsFile = () => {

/*
*

// Importing external and core packages.
const fs = require('fs');
const path = require('path');

// Creating the blacklist file path.
const blacklist_path = path.join(__dirname, '..', '/resources/blacklist.json');


exports.isEmptyArray = (myArray) => {
	return (myArray.length < 1 || myArray === undefined) ? true : false;
}

exports.isUndefined = (myVar) => {
	return (myVar === undefined) ? true : false;
}

exports.createResponse = (status, message, data) => {

	// We check if the response if an error or not. And besides it, we check if we need to include
	// some data on the response.
	if(status != 200) {
		if(data!= null) {
			return { ok: false, status, error: { message, data } };
		} else {
			return { ok: false, status, error: { message } };
		}
	} else {
		if(data!= null) {
			return { ok: true, status, result: { message, data } };
		} else {
			return { ok: true, status, result: { message } };
		}
	}
	
}

exports.createError = (status, message, data) => {
	let error = new Error(message);
	error.statusCode = status;
	if(data) error.data = data;

	return error;
}

exports.manageBadRequests = async (req) => {
	// Create, if not exists, a blacklist file.
	if(!fs.existsSync(blacklist_path)) fs.writeFileSync(blacklist_path, JSON.stringify({ hacker_list: [], requests_list: [] }, null, 2));

	// We read and parse the file.
	const blacklist_raw = fs.readFileSync(blacklist_path);
	let blacklist = JSON.parse(blacklist_raw);
	
	// Create a new bad request object with the interesting data of the requests to detect hackers.
	let bad_request_object = {
		date: new Date(),
		baseUrl: req.baseUrl,
		method: req.method,
		hostname: req.hostname,
		ip: req.ip,
		ips: req.ips,
		originalUrl: req.originalUrl,
		path: req.path,
		protocol: req.protocol,
		secure: req.secure,
		subdomains:req.subdomains,
		body: req.body,
		params: req.params,
		query: req.query,
		cookies: req.cookies
	};
 	
 	// Include the new object on a list and the requests ip on another list (To faster prevent hacker attacks).
	if(!blacklist.hacker_list.includes(req.ip)) blacklist.hacker_list.push(req.ip);
	blacklist.requests_list.push(bad_request_object);

	// Overwrite the blacklist with the new information.
	fs.writeFileSync(blacklist_path, JSON.stringify(blacklist, null, 2));
}

*
*/

return `// Importing external and core packages.\nconst fs = require('fs');\nconst path = require('path');\n\n// Creating the blacklist file path.\nconst blacklist_path = path.join(__dirname, '..', '/resources/blacklist.json');\n\n\nexports.isEmptyArray = (myArray) => {\n    return (myArray.length < 1 || myArray === undefined) ? true : false;\n}\n\nexports.isUndefined = (myVar) => {\n    return (myVar === undefined) ? true : false;\n}\n\nexports.createResponse = (status, message, data) => {\n\n    // We check if the response if an error or not. And besides it, we check if we need to include\n    // some data on the response.\n    if(status != 200) {\n        if(data!= null) {\n            return { ok: false, status, error: { message, data } };\n        } else {\n            return { ok: false, status, error: { message } };\n        }\n    } else {\n        if(data!= null) {\n            return { ok: true, status, result: { message, data } };\n        } else {\n            return { ok: true, status, result: { message } };\n        }\n    }	\n\n}\n\nexports.createError = (status, message, data) => {\n    let error = new Error(message);\n    error.statusCode = status;\n    if(data) error.data = data;\n\n    return error;\n}\n\nexports.manageBadRequests = async (req) => {\n    // Create, if not exists, a blacklist file.\n    if(!fs.existsSync(blacklist_path)) fs.writeFileSync(blacklist_path, JSON.stringify({ hacker_list: [], requests_list: [] }, null, 2));\n\n    // We read and parse the file.\n    const blacklist_raw = fs.readFileSync(blacklist_path);\n    let blacklist = JSON.parse(blacklist_raw);\n\n    // Create a new bad request object with the interesting data of the requests to detect hackers.\n    let bad_request_object = {\n        date: new Date(),\n        baseUrl: req.baseUrl,\n        method: req.method,\n        hostname: req.hostname,\n        ip: req.ip,\n        ips: req.ips,\n        originalUrl: req.originalUrl,\n        path: req.path,\n        protocol: req.protocol,\n        secure: req.secure,\n        subdomains: req.subdomains,\n        body: req.body,\n        params: req.params,\n        query: req.query,\n        cookies: req.cookies\n    };\n\n    // Include the new object on a list and the requests ip on another list (To faster prevent hacker attacks).\n    if(!blacklist.hacker_list.includes(req.ip)) blacklist.hacker_list.push(req.ip);\n    blacklist.requests_list.push(bad_request_object);\n\n    // Overwrite the blacklist with the new information.\n    fs.writeFileSync(blacklist_path, JSON.stringify(blacklist, null, 2));\n}`;

}