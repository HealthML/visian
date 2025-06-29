/**
 * Polyfill stable language features. These imports will be optimized by `@babel/preset-env`.
 *
 * See: https://github.com/zloirock/core-js#babel
 */
import "core-js/stable";
import "regenerator-runtime/runtime";
import WebXRPolyfill from "webxr-polyfill";
// eslint-disable-next-line no-new
new WebXRPolyfill();
