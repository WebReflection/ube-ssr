# µbe-ssr

![lego board with µbe logo](./test/ube.jpg)

<sup>**Original Social Media Photo by [JOSE LARRAZOLO](https://unsplash.com/@joseadd) on [Unsplash](https://unsplash.com/)**</sup>


An SSR, islands friendly, way to render [µbe components](https://github.com/WebReflection/ube#readme) on the page, either dynamically, or statically, producing single SPA like files that are also easy to share.

**Features**

  * based on [js-in-json](https://github.com/WebReflection/js-in-json)
  * incremental or "*all at once*" **hydration** via builtin elements (no Custom Elements, no Polyfills needed)
  * can generate, or build, on the fly, or produce static HTML pages with all dependencies on demand served within it (no network requests)
  * bootstraps and serve pre-cached js-in-json content in 0 to few milliseconds

### How to

```js
import http from 'http';
import {join} from 'path';

import ube from 'ube-ssr';

const {
  // provides same ube helpers
  render, html, svg,
  // plus utilities to define components
  // and bootstrap before serving
  include, bootstrap
} = ube({
  // all same options available in js-in-json
  ...options,

  // plus optional `flush`:
  //  if `incremental`, will flush after each component,
  //  otherwise will add a <script> with all needed content
  //  after rendering
  flush: 'incremental'
});

// define what µbe should be included, and what
// kind of tagName it represents on the page
const Div = include('comp/div.js').as('div');
const Button = include('comp/clicker.js').as('button');
// if not used in the template, their content won't be
// on the page neither


// prepare the islands/sessions to use automatically
await bootstrap(
  // if a cache object is passed, it'll be used.
  // if a boolean `true` is passed, and the cached
  // js-in-json file exists (output), it will use it.
  // in all other cases, it builds the cache and,
  // if the output was specified, will save it there
  !!process.env.PRODUCTION
);

// http example
http
  .createServer((req, res) => {
    render(res, html`
      <!doctype html>
      <${Div}>Hello SSR 👋 </${Div}>
      <!-- incremental flushes example -->
      <${Div}>Hello Again 👋 </${Div}>
    `);
  })
  .listen(8080);
```

See the [test](./test/index.js) example or the produce [HTML output](./test/index.html).

Find the [list of js-in-json options](https://github.com/WebReflection/js-in-json#options) and remember that the `root` folder is the only mandatory field, and it should point at where your client-side JS files / components are.


### In Details

*µbe* components are like custom elements, builtin or not, with a unique feature: they don't need a registry, and there's never a name clashing.

These components are the best one to *hydrate*, because they don't require changes in the layout, like it is for custom elements.

With *µbe-ssr* this potential goes beyond client-side components definition:

  * layout can be served same way [µhtml-ssr](https://github.com/WebReflection/uhtml-ssr#readme) does already
  * components can be simple (only behaviors attached on the fly) or could render themselves on the fly
  * the hydration can be instantaneous (using `flush: "incremental"` special option) or performed only at the end of the rendered content
  * the JS code is automatically split in chunks and dependencies so that only rendered components lands once, as definition, and these are incrementally hydrated on the fly, or at the end

Both `babel` and `minify` options from *js-in-json* makes it super easy to debug real/native code, and can be set as `false` only during development, with `minify` and `output` able to produce best results in terms of performance and portability.

Any static site host can work without issues, but once the *js-in-json* cache is produced, creating highly dynamic, or reactive, pages, is also possible and pretty damn fast.
