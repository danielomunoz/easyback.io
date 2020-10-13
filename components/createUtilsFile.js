const fs = require('fs');
const path = require('path');


exports.createUtilsFile = () => {
	
	const utils_file_path = path.join(__dirname, '..', 'backends', 'backend', 'app', 'utils', 'utils.js');

	const utils_file = `  
/*
* This is the utils file, containing some utils functions located along the code. Some functions as 
* 'isEmptyArray' or 'isUndefined' act like a validator package as lodash, but without the whole bunch
* of mess that this package introduce inside node_modules, not to mention the vulnerabilites. The other
* functions are destined to create responses to send to the fronted ('createResponse'), create errors 
* that will be thrown along the code ('createError') and manage the bad requests that reach the server 
* creating a blacklist file to identify possible and dangerous hackers, and avoiding attacks to our api 
* (manageBadRequests).
*/

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
}`;

	fs.writeFileSync(utils_file_path, utils_file);

}