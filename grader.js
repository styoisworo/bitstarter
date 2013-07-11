#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

//satyo's add

var util = require('util');
var rest = require('restler');
var HTML_TEMP = "temp.html";

// var buildhtml = function(html_write_file){
//   var rest2html = function(result, response){
//     if(result instanceof Error){
//       console.error('Error: '+ util.format(response.message));
//     }
//     else{
//       console.error('Wrote: '+ htmlfile);
//       fs.writeFileSync(htmlfile, result);
//     }
//   };
//   return rest2html;
// };

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlURL = function(url, checksfile) {
    html_write_file = HTML_TEMP;
    rest.get(url).on('complete', function(response){
      if(response instanceof Error){
        console.log(response.message);
      }
      else{
        //console.log(response);
        //fs.open('.'+html_write_file, 'w+');
        fs.writeFileSync(html_write_file, response);
      }
    });

    $ = cheerioHtmlFile(html_write_file);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_addr>', 'url address')
        .parse(process.argv);
    if(program.file){
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
    }
    if(program.url){
      console.log(program.url);
      var checkJson2 = checkHtmlURL(program.url, program.checks);
      var checkJson3 = checkHtmlFile(HTML_TEMP, program.checks);
      var outJson2 = JSON.stringify(checkJson3, null, 4);
      fs.unlink(HTML_TEMP); // remove the temp file :)
    }
    console.log("HTML file checks: ");
    console.log(outJson);
    console.log("URL checks: ");
    console.log(outJson2);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}