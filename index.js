/**
 * @preserve Copyright (c) 2014 Anselm Meyn
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";

var path = require('path');

/*
*/
function Option(optionOptions) {
	for (var index in optionOptions) {
		if (optionOptions[index]) {
			this[index] = optionOptions[index];
		}
	}
}

/*
*/
function setupStringOpts(optString) {
	var optsList = {};
	optString.split('').forEach(function(val, index, list) {
		var opt,
			needsArg,
			isRequired;

		switch(val) {
		case '!':
			if (list[index-1] === ':') {
				needsArg = true;
				opt = list[index-2];
			}
			else {
				opt = list[index-1];
			}
			isRequired = true;
			break;
		case ':':
			opt = list[index-1];
			needsArg = true;
			break;
		default:
			opt = val;
			break;
		}

		if (opt && opt.match(/^[A-Za-z0-9]$/)) {
			optsList[opt] = new Option({
				needsArg: needsArg,
				isRequired: isRequired
			});
		}
	});
	return optsList;
}

/*
*/
function setupArrayOpts(optsArray) {
	var optsList = {};
	optsArray.forEach(function(val, index, list) {
		var opt,
			needsArg,
			isRequired;

		switch(val.substr(-1)) {
		case '!':
			if (val.slice(0, -1).substr(-1) === ':') {
				needsArg = true;
			}
			opt = val.match(/([A-Za-z0-9]+)/)[1];
			isRequired = true;
			break;
		case ':':
			opt = val.slice(0, -1);
			needsArg = true;
			break;
		default:
			opt = val;
			break;
		}

		if(opt && opt.match(/^[A-Za-z0-9]+/)) {
			optsList[opt] = new Option({
				needsArg: needsArg,
				isRequired: isRequired,
				isLong: (opt.length > 1)
			});
		}
	});
	return optsList;
}


function createArgHelper(optionsString, optionsHelp, argv) {
	var obj = {
		info: {},
	};

	/*
	*/
	function parseOptString(optString) {
		if (typeof optString === "string" || optString instanceof String) {
			return setupStringOpts(optString);
		}
		else if (optString instanceof Array) {
			return setupArrayOpts(optString);
		}
	}

	/*
	*/
	function parseArgs(argv, options) {
		var optRegEx = new RegExp("(^-{1,2})([A-Za-z0-9 ,]+)");
		var nonOptional = [];
		var result = {};

		if (!options || Object.keys(options).length <= 0) {
			return { 'nonOpt': argv };
		}
		for (var i=0; i<argv.length; ++i) {
			// As per POSIX any args after a '--' should be considered non-optional
			if (argv[i] === '--') {
				nonOptional = nonOptional.concat(argv.slice(i+1));
				break;
			}

			// RegExp.exec() returns an array with the following elements,
			// [0] - the matched character(s)
			// [1]..[n] - matched substrings (in parenthesis i.e. 2 in our case)
			// index: index of the match in the string
			// input: original string
			// 		OR
			// null if no match
			var optionMatch = optRegEx.exec(argv[i]);

			if (!optionMatch) {
				nonOptional.push(argv[i]);
			}
			else {
				// the option is in the 2nd matched substring
				var currentOptionStr = optionMatch[2];

				// use the first substring match to determine short / long option
				if (optionMatch[1] === '--') {
					if (options[currentOptionStr]) {
						if (options[currentOptionStr].needsArg) {
							if (i+1 < argv.length) {
								result[currentOptionStr] = argv[++i];
							}
							else {
								throw new Error("option needs an argument -- " + currentOptionStr);
							}
						}
						else {
							result[currentOptionStr] = true;
						}
					}
					else {
						throw new Error("unrecognized option -- " + currentOptionStr);
					}
				}
				else if(optionMatch[1] === '-') {
					if (!currentOptionStr) { // if it was only a '-'
						nonOptional.push(argv[i]);
					}
					else {
						for (var j=0; j<currentOptionStr.length; ++j) {
						    var currChar = currentOptionStr.charAt(j);
						    var remainingChars = currentOptionStr.substring(j+1);
						    if (options[currChar]) {
						        if (options[currChar].needsArg) {
									if (remainingChars) {
										result[currChar] = remainingChars;
									}
									else if (i+1 < argv.length) {
										result[currChar] = argv[++i];
									}
									else {
										throw new Error("option needs an argument -- " + currChar);
									}
						            break;
								}
								else {
									result[currChar] = true;
								}
							}
							else {
								throw new Error("unrecognized option -- " + currChar);
							}
						}
					}
				}
			}
		}

		if (nonOptional.length > 0) {
			result['nonOpt'] = nonOptional;
		}

		return result;
	}

	/*
	*/
	function buildSummaryStr(usage, options, optionsHelp) {
		var summaryStr = [];
		if (options) {
			for (var index in optionsHelp) {
				if (options[index] && optionsHelp[index]) {
					summaryStr.push('\t-' + index + '\t' + optionsHelp[index]);
				}
			}
			if (summaryStr.length > 0) {
				summaryStr.unshift('Options:');
			}
			optionsHelp && optionsHelp['pre'] && summaryStr.unshift(optionsHelp['pre']);
			optionsHelp && optionsHelp['post'] && summaryStr.push(optionsHelp['post']);
		}
		summaryStr.unshift('Usage: ' + usage);
		return summaryStr.join('\n');
	}

	/*
	*/
	function buildUsageStr(argv, options) {
		var usageStr = [];
		var currStr;
		for (var index in options) {
			var option = options[index];
			currStr = '';
			if (option) {
				currStr = (option.isLong ? '--' : '-') + index;
				if (option.needsArg) {
					currStr += ' value';
				}
				if (option.isRequired) {
					usageStr.unshift(currStr);
				}
				else {
					usageStr.push('['+currStr+']');
				}
			}
		}
		usageStr.unshift(argv[0], path.basename(argv[1]));
		return usageStr.join(' ');
	}

	// -- main() --
	argv = argv || process.argv;
	var optionsList = parseOptString(optionsString);
	var result = parseArgs(argv.slice(2), optionsList);
	for (var index in result) {
		obj[index] = result[index];
	}
	for (var index in optionsList) {
		var option = optionsList[index];
		if (option.isRequired && !obj[index]) {
			throw new Error('required option missing -- ' + index);
		}
	}
	obj['argv'] = process.argv;
	var usageStr = buildUsageStr(argv, optionsList)

	obj.info = {
		usage: usageStr,
		summary: buildSummaryStr(usageStr, optionsList, optionsHelp)
	};

	return obj;
}

module.exports = createArgHelper;
