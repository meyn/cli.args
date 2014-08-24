cli.args
========

Flexible and easy command line arguments handling library for your node.js applications.

## Description

Uses a ```getopt()``` style options string to parse command line arguments. Supports both POSIX (short) and GNU long format option arguments.

## Installation

    npm install cli.args

## Usage

1. Handling a command line argument (```-p```) which requires a value,
    ```js
    var args = require('cli.args')('p:');
    console.log('-p=' + args.p);
    ```
    use as,
    ```bash
    $ node app.js -p 8080; #output "-p=8080"
    ```

2. Handling multiple arguments (```-p```, ```-s```, ```-u```) with some requiring values (```-p```),
    ```js
    var args = require('cli.args')('p:su');
    console.log('-p=' + args.p + ', -s set: ' + (args.s ? 'y' : 'n') + ', -u set: ' + (args.u ? 'y' : 'n'));
    ```
    use as,
    ```bash
    $ node app.js -s -p 8080; #outputs "-p=8080, -s set: y, -u set: n"
    ```

3. Specifying required arguments,
    ```js
    var args = require('cli.args')('p:!s');
    console.log('-p=' + args.p);
    console.log('-s set? ' + (args.s ? 'y': 'n'));
    ```
    use as,
    ```bash
    $ node app.js -s; #throws an Error for missing required argument '-p'
    ```

4. Handling long-format arguments,
    ```js
    var args = require('cli.args')(['port:', 'debug']);
    console.log('--port=' + args.port);
    console.log('--debug? ' + (args.debug ? 'y': 'n'));
    ```
    use as,
    ```bash
    $ node app.js --port 8080; #outputs "--port=8080"
                               #        "--debug? n"
    $ node app.js --port 8080 --debug; #outputs "--port=8080"
                                       #        "--debug? y"
    ```

## Tests

    npm test
    
## Release history

    0.0.3 Initial release
