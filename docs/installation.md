#### Installation and running (Hosting a web-server, the requirements)
A web-server hosting this application code has two requirements:
* Web-socket communication: Required for the prototype to run accommodate communication between clients, thus solely static file hosting will not suffice.
* Secure connection: The organizing client must consider the website to be secure, since this is a requirement for standard web-browsers to allow exposing the microphone. Firefox considers a website to be secure if it is either accessed localhost or is secured with HTTPS.

A localhost web-server with web-socket communication out-of-the-box is provided by running the `server.js` with `node`.

This can be achieved by following the default installation procedure:
1. Default installation technique of packages with any JavaScript package manager that understands the default `package.json` format.
  * E.g. with [npm](https://docs.npmjs.com/cli/v8/commands/npm-install) with `npm install`
  * Or with [yarn](https://yarnpkg.com/cli/install) with `yarn install`.
2. Run with `node server.js` to host a minimal [Express](http://expressjs.com/) web-server on port 3000.

Or with a custom solution:
I host with [nginx](https://github.com/nginx/nginx) (supports web-sockets and certificate handling).
