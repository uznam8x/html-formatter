if (typeof define === "function" && define.amd) {
    define([
        "./src/closing.js",
        "./src/entity.js",
        "./src/minify.js",
        "./src/render.js"
    ], function (closing, entity, minify, render) {
        return {
            closing: closing,
            entity: entity,
            minify: minify,
            render: render
        };
    });
} else {
    (function (mod) {
        var closing = require('./src/closing.js');
        var entity = require('./src/entity.js');
        var minify = require('./src/minify.js');
        var render = require('./src/render.js');

        mod.exports = {
            closing: closing,
            entity: entity,
            minify: minify,
            render: render
        };
    })(module);
}