const wa_version = require("@wppconnect/wa-version");
const semver = require("semver");
const fs = require("fs");
const path = require("node:path");

function getPagePath(versionMatch, includePrerelease = true) {
	if (!versionMatch) {
		versionMatch = wa_version.getLatestVersion();
	}

	const versions = wa_version.getAvailableVersions();

	const max = semver.maxSatisfying(versions, versionMatch, {
		includePrerelease,
	});

	if (!max) {
		throw new Error(`Version not available for ${versionMatch}`);
	}

	return path.join(wa_version.constants.HTML_DIR, max + ".html");
}

var index_path = getPagePath('2.3000.1012940167-alpha');

(async () => {
	const mockttp = require('mockttp');

	const server = mockttp.getLocal({
		https: {
			keyPath: './key.pem',
			certPath: './cert.pem'
		}
	});
	
	await server.start();
	
	console.log('index_path', index_path);

	server.forGet("web.whatsapp.com").always().thenPassThrough({
		beforeResponse: (response) => {
			response.body = fs.readFileSync(index_path, "utf8");
			return response;
		}
	});

	server.forGet("https://web.whatsapp.com/check-update").always().thenCloseConnection();

	server.forAnyRequest().thenPassThrough();
	server.forAnyWebSocket().thenPassThrough();

	console.log(`Server running on port ${server.port}`);
})()
