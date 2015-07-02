var endomain = require('./endomain');

module.exports = context;

var name = 'endomain';

/**
 * Context middleware.
 * ```js
 * var app = express();
 * app.use(endomain.context(options));
 * ...
 * app.listen();
 * ```
 * @options {Object} [options] Options for context
 * @property {String} name Context scope name.
 * @property {Boolean} enableHttpContext Whether HTTP context is enabled.  Default is false.
 * @property {Array|Object} chains The objects to be chained.
 * @header endomain.context([options])
 */

function context(options) {
    options = options || {};
    var scope = options.name || name;
    var enableHttpContext = options.enableHttpContext || false;
    var ns = endomain.createContext(scope, options.chains);

    // Return the middleware
    return function contextHandler(req, res, next) {
        if (req.endomainContext) {
            return next();
        }

        endomain.runInContext(function processRequestInContext(ns, domain) {
            req.endomainContext = ns;

            // Bind req/res event emitters to the given namespace
            ns.bindEmitter(req);
            ns.bindEmitter(res);

            // Add req/res event emitters to the current domain
            domain.add(req);
            domain.add(res);

            // Run the code in the context of the namespace
            if (enableHttpContext) {
                // Set up the transport context
                ns.set('http', {req: req, res: res});
            }
            next();
        });
    };
}
