'use strict';

const Assert = require('./helpers/Assert');
const validator = Assert.validator;
const isObject = validator.isObject;
const isArray = validator.isArray;
const isNotBlank = validator.isNotBlank;
const format = require('util').format;

function initName(params) {
  return isNotBlank(params.name) ? params.name : 'mw-chain';
}

function initLog(params) {
  const loggers = isObject(params.loggers) ? params.loggers : {};
  return {
    debug: loggers.debug instanceof Function ?
      (m, ...p) => { loggers.debug(format(m, ...p)); } :
      () => undefined,
    error: loggers.error instanceof Function ?
      (m, ...p) => { loggers.error(format(m, ...p)); } :
      (m, ...p) => { console.error(m, ...p); }
  };
}

function initMiddlewares(params) {
  const middlewares = [];
  const catchers = [];
  if (isArray(params.middlewares)) {
    for (let index = 0; index < params.middlewares.length; index++) {
      const middleware = params.middlewares[index];
      Assert.isTruthy(
        !!middleware && middleware instanceof Function &&
        middleware.length > 1 && middleware.length < 5,
        `Invalid middleware at index ${index}. Must be: (req, res[, next]) || (err, req, res, next)`);
      if (middleware.length === 4) {
        catchers.push(middleware);
      } else {
        middlewares.push(middleware);
      }
    }
  }
  return { middlewares, catchers };
}

const stackSpacer = '\n    | ';
function formatStack(error) {
  return stackSpacer + (error instanceof Error ?
    ((error.stack && error.stack.replace(/\n/g, stackSpacer)) ||
      (error && error.toString().replace(/\n/g, stackSpacer))) : error.toString());
}

function buildCatcher(params) {
  const chain = params.catchers.length === 0 ? params.next :
    (error, index = 0) => {
      let currentError = error;
      params.debug('[%s:catcher:%s] - start -', params.name, index);
      const nextCallback = (nextError) => {
        params.debug('[%s:catcher:%s] - called next -', params.name, index);
        if (!nextError) {
          params.error('[%s:catcher:%s] No error was passed by catcher.',
            params.name, index);
          params.next();
        } else if (index < params.catchersLastIndex) {
          if (currentError !== nextError) {
            currentError = nextError;
            params.error('[%s:catcher:%s] A different error was passed.%s',
              params.name, index, formatStack(nextError));
          }
          chain(nextError, index + 1);
        } else {
          params.next(nextError);
        }
      };
      try {
        params.catchers[index](error, params.req, params.res, nextCallback);
      } catch (error) {
        params.error('[%s:catcher:%s] An unhandled error was thrown.%s',
          params.name, index, formatStack(error));
        nextCallback(error);
      }
    };
  return chain;
}

function executeMiddleware(params) {
  const catcher = buildCatcher(params);
  const middleware = params.middlewares.length === 0 ? params.next :
    (index = 0) => {
      params.debug('[%s:middleware:%s] - start -', params.name, index);
      const nextCallback = (nextError) => {
        params.debug('[%s:middleware:%s] - called next -', params.name, index);
        if (nextError) {
          params.error('[%s:middleware:%s] An error was passed.%s',
            params.name, index, formatStack(nextError));
          catcher(nextError);
        } else if (index < params.middlewaresLastIndex) {
          middleware(index + 1);
        } else {
          params.next();
        }
      };
      try {
        params.middlewares[index](params.req, params.res, nextCallback);
      } catch (error) {
        params.error('[%s:middleware:%s] An unhandled error was thrown.%s',
          params.name, index, formatStack(error));
        catcher(error);
      }
    };
  middleware();
}

function chain(params = {}) {
  const name = initName(params);
  const log = initLog(params);
  const middlewares = initMiddlewares(params);
  const context = (req, res, next) => ({
    name, debug: log.debug, error: log.error,
    middlewares: middlewares.middlewares,
    middlewaresLastIndex: middlewares.middlewares.length - 1,
    catchers: middlewares.catchers,
    catchersLastIndex: middlewares.catchers.length - 1,
    req, res, next
  });
  return function (req, res, next) {
    executeMiddleware(context(req, res, next));
  };
}

module.exports = chain;