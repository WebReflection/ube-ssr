import {existsSync} from 'fs';
import {join, resolve} from 'path';

import {JSinJSON} from 'js-in-json';
import {asParams, asStatic} from 'static-params';
import {Hole, render as urender, html as uhtml, svg as usvg} from 'uhtml-ssr';

import umeta from 'umeta';
const {dirName, require: cacheReader} = umeta(import.meta);

const UBE = 'data-ube';
const MAIN = '$';

class Tag {
  constructor(id) {
    this.id = id;
    this.name = '';
  }
}

export default options => {
  const augment = tag => {
    function ube() { return reshaped.apply(tag, arguments); }
    ube.for = (ref, id) => function () {
      return reshaped.apply(tag.for(ref, id), arguments);
    };
    return ube;
  };

  const cache = new Map;

  const modules = {
    [MAIN]: {
      input: join(dirName, 'utils.js')
    }
  };

  const setup = () => {
    if (js === null) {
      js = session();
      js.add(MAIN);
    }
  };

  let session = null;
  let js = null;
  let id = 0;

  const root = resolve(options.root);
  const incremental = options.flush === 'incremental';
  const module = !!options.module;

  return {
    html: augment(uhtml),
    svg: augment(usvg),
    render(where, what) {
      setup();
      const result = urender(where, what);
      if (js.map.size) {
        const content = new Hole(js.flush());
        urender(
          where,
          module ?
            uhtml`<script type=module>${content}</script>` :
            uhtml`<script>${content}</script>`
        );
      }
      js = null;
      return result;
    },

    include(module) {
      const input = resolve(root, module);
      if (!cache.has(input)) {
        const uid = id++;
        modules[uid] = {
          input,
          code: `function($){$.${MAIN}.$($,${uid})}`
        };
        cache.set(input, new Tag(uid));
      }
      return {
        as(name) {
          const tag = cache.get(input);
          tag.name = name;
          return tag;
        }
      };
    },

    bootstrap: cache => new Promise($ => {
      const resolve = cache => {
        session = islands.session.bind(islands, cache);
        $();
      };
      const islands = JSinJSON({...options, root, modules});
      const {output} = options;
      if (typeof cache === 'object')
        resolve(cache);
      else if (cache && output && existsSync(output))
        resolve(cacheReader(output));
      else
        islands.save().then(resolve);
    })
  };

  function reshaped(template) {
    setup();
    const args = [template];
    for (let i = 1, {length} = arguments; i < length; i++) {
      let current = arguments[i];
      if (current instanceof Tag) {
        const tagName = current.name;
        const prev = template[i - 1];
        js.add(current.id);
        switch (prev[prev.length - 1]) {
          case '<':
            current = asStatic(`${tagName} ${UBE}=${current.id}`);
            break;
          case '/':
            current = incremental ?
              asStatic(
                `${tagName}><script${
                  module ? ' type=module' : ''
                }>${js.flush()}</script`
              ) :
              asStatic(tagName);
            break;
        }
      }
      args.push(current);
    }
    return this.apply(null, asParams.apply(null, args));
  }
};
