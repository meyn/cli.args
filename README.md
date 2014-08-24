cli.args
========

Easy command line arguments handling library for your node.js applications.

## Installation

    npm install cli.args

## Usage

    // accept a command line argument '-p' which requires a value
    var args = require('cli.args')('p:');
    console.log('-p value:', args.p);

    // accept multiple arguments '-p', '-s' (only '-p' requires a value)
    var args = require('cli.args')('p:s');
	console.log('-p value:', args.p);
	console.log('-s set?', args.s ? "yes" : "no");

	// accept multiple arguments '-p', '-s' & '-u' which dont need values
	// may be specified either as '-psu' or '-p -s -u' on the command-line
	var args = require('cli.args')('psu');
	console.log('-p set?', args.p ? "yes" : "no");
	console.log('-s set?', args.s ? "yes" : "no");
	console.log('-u set?', args.u ? "yes" : "no");

	// accept long-format arguments
	var args = require('cli.args')(['port:']);
	console.log('--port value:', args.port);

## Tests

    npm test
    
## Release history

    0.0.1 Initial release
