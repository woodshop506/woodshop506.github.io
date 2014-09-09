// grunt-pure-place
// ----------
// A Grunt task that consumes Pure/src/**/css/*.css and creates Sass placeholders
// Based off of https://github.com/jney/grunt-rework
 
module.exports = function(grunt) {
  
  grunt.registerMultiTask('pure-place', 'Builds SCSS files with placeholders.', function () {
    var _ = grunt.util._;
    var rework = require('rework');
    var options = this.options();
    options.toString = options.toString || {};
    options.use = options.use || [];
    options.vendors = options.vendors || [];
    options.dest = options.dest || this.dest || 'scss';


    grunt.verbose.writeflags(options, 'Options');

    var async = grunt.util.async;
    var done = this.async();

    var pureFiles = {};

    async.forEach(this.files, function(file, next) {
      var src = _.isFunction(file.src) ? file.src() : file.src;
      var srcFiles = grunt.file.expand(src);

      var fileFn,filesDoneFn;

      fileFn = function(srcFile, nextF) {
        var srcCode = grunt.file.read(srcFile);
        var css = rework(srcCode).use(function(style){
            style.rules.forEach(function(rule, ruleIndex) {
              if(rule.selectors !== undefined)
                rule.selectors.forEach(function(selector, selectorIndex){
                  newSel = selector.replace(/\.pure/g, '%pure');
                  style.rules[ruleIndex].selectors[selectorIndex] = newSel;
                });
            });
          }).toString(options.toString);

        // Generate dest path
        var pathArr = srcFile.split('/');
        pathArr[0] = options.dest;
        pathArr.splice(2,1);
        var filename = pathArr.pop();
        filename = "_" + filename.replace(/css$/, 'scss');
        pathArr.push(filename);
        var dest = pathArr.join('/')

        // Build up master pure file
        var folder = pathArr[1];
        if(pureFiles[folder] === undefined)
          pureFiles[folder] = [];
        pureFiles[folder].push(pathArr[2]);

        grunt.file.write(dest, css);
        grunt.log.oklns('File "' + dest + '" created.');
        nextF();
      }
        
      filesDoneFn = function(err){
        if(err) {
          grunt.log.writeln(err);
          return next();
        }
        var out = "// Pure built as SASS placeholders\n\n";
        var dest_file = "scss/_pure.scss";
        for(k in pureFiles) {
          var v = pureFiles[k]; 
          if(!pureFiles.hasOwnProperty(k))
            continue;
          // Handle the base files differently
          if(k === 'base') {
            out += "@import \"base/normalize\";\n";
            out += "@import \"base/normalize-context\";\n";
            out += "\n";
            continue;
          }
          out += "/* " + k[0].toUpperCase() + k.substr(1) + "*/\n";
          pureFiles[k].forEach(function(filename) {
            out += '@import "' + k + "/" + filename.substr(1) + "\";\n";
          });
          out += "\n"; 
        }
        grunt.file.write(dest_file,out);
        grunt.log.oklns('File ' + dest_file + ' created');
        next();
      }

      async.forEach(srcFiles, fileFn.bind(this), filesDoneFn.bind(this), done);
    });
  });
}
