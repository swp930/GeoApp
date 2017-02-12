Segment Developer Tools
=======================

Prerequisites
-------------

* OS X v10.9 or greater
* [Node.js](https://nodejs.org/en/) v4.5.0 or greater
* npm v2.15.9 or greater

From the terminal, use the following commands to confirm that you have appropriate versions of Node.js and npm.

$ node --version
$ npm --version

How to build the Segment Developer Tools
----------------------------------------

If you are inside a private network, configure your npm proxy.

$ npm config set proxy <proxy URL>
$ npm config set https-proxy <proxy URL>

Extract the files from the Segment Developer Tools package, and change directories to the root folder for the extracted files.

$ cd SegmentDeveloperTools

Install the node modules for the Segment Developer Tools app.

$ npm install

Build the application.  
The application is created as `SegmentDeveloperTools.app` in the `dist/SegmentDeveloperTools-darwin-x64` subdirectory.

$ npm run build
