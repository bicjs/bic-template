'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var jade = require('jade');

// Logger
var logger = require('@bicjs/bic-logger').get('template');

var content;

var render = function(config) {

  function getFilePath(fileDir, filePath) {

    if (filePath.indexOf('.jade') !== -1) {

      return path.join(fileDir, filePath);

    } else {

      return path.join(fileDir, filePath, 'index') + '.jade';
    }
  }

  // TODO: Test passing a config file path instead of an object
  function getFileData(fileData) {

    return typeof fileData === 'string' ? fs.readJsonSync(fileData) : fileData;
  }

  function getPageData(filePath, fileData) {

    filePath = path.join(config.pageDir, filePath);

    return _.merge(fileData, {
      page: {
        path: {
          relative: path.relative(filePath, config.pageDir),
          absolute: (config.pageDir !== filePath) ? '/' + path.relative(config.pageDir, filePath) : ''
        }
      }
    });
  }

  return {

    get page() {

      var _render = this;

      return {

        html: function(filePath, fileData, parentData) {

          return _render.file.html(getFilePath(config.pageDir, filePath), getPageData(filePath, getFileData(fileData)), parentData);
        },

        promise: function(filePath, fileData, parentData) {

          return _render.file.promise(getFilePath(config.pageDir, filePath), getPageData(filePath, getFileData(fileData)), parentData);
        }
      };

    },
    get module() {

      var _render = this;

      return {

        html: function(filePath, fileData, parentData) {

          return _render.file.html(getFilePath(config.moduleDir, filePath), getFileData(fileData), parentData);
        },

        promise: function(filePath, fileData, parentData) {

          return _render.file.promise(getFilePath(config.moduleDir, filePath), getFileData(fileData), parentData);
        }
      };

    },
    get file() {

      var _render = this;

      return {

        html: function(filePath, fileData, parentData) {

          fileData = getFileData(fileData);

          try {

            config.jade.render = _render;

            config.jade.data = {
              module: fileData || {},
              parent: parentData || {}
            };

            content = fs.readFileSync(filePath, { encoding: 'utf-8' });

            if (config.process.jade && config.process.jade.length > 0) {

              content = config.process.jade.map(function(process) {

                return process(content);
              });
            }

            content = jade.render(content, config.jade);

            if (config.process.html && config.process.html.length > 0) {

              content = config.process.html.map(function(process) {

                return process(content);
              });
            }

            return content;

          } catch (err) {

            // Log the error, but don't throw it so that the build can keep
            // going and doesn't have to be restarted.
            logger.error('Rendering Error', err);
          }
        },

        promise: function(filePath, fileData, parentData) {

          fileData = getFileData(fileData);

          var _file = this;

          return new Promise(function(resolve, reject) {

            try {

              resolve(_file.html(filePath, fileData, parentData));

            } catch (err) {

              logger.error('Rejecting Promise', err);

              reject(err);
            }
          });
        }
      };
    }
  };
};

module.exports = render;
