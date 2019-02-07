title: Transducers, powerful abstractions
author:
  name: I'model Adrien, frontend developer
  email: a.gibrat@oodrive.com
theme: ./theme
controls: false
output: index.html

--

# Transducers

## powerful abstractions

<center>![Oodrive](theme/img/logo.jpg)</center>

--

## Transducers 𝍏

> <cite>[clojure.org](https://clojure.org/reference/transducers)</cite>
compose transformations <br>without awareness of input <br>nor creation of intermediate aggregates

<small style="float:left;">in physics *convert energy to signal*</small>

<small style="float:right;margin-right:45px">in biology *transfer genetic material*</small>

--

## Foreword, curry ♨

> <dfn title="Function that takes one or more functions as arguments / returns a function">[Higher-order function](https://www.youtube.com/watch?v=BMUiFMZr7vk)</dfn> that transform <br><dfn title="Function with exactly n arguments">[n-ary function](https://xlinux.nist.gov/dads/HTML/naryfunc.html)</dfn> to a chain of *n* <dfn title="Function that takes one argument">[unary function](https://xlinux.nist.gov/dads/HTML/unaryfunc.html)</dfn>

```typescript
import { curry, assert } from 'demo';

const sum3 = (a: number, b: number, c: number) => a + b + c;
const result = curry(sum3)(1)(2)(3); // 6

assert(curry(sum3)(1, 2)(3) === curry(sum3)(1)(2, 3), 'pragmatic curry');
```
[Ramda](https://ramdajs.com/docs) & [lodash/fp](https://gist.github.com/jfmengels/6b973b69c491375117dc) docs

--

## Blog example 😪

```typescript
import { Post, pick, replace, take, update } from 'demo';

const exerpts = (posts: Post[]) =>
  posts
    .map(pick(['title', 'body']))
    .map(update('body', replace(/<[^>]*>?/g, '')))
    .map(update('body', take<string>(30)))
;
```

<big style="color: red">❌</big> Loop 3&times;, allocating new array each time

--

## Fusion 😃

```typescript
import { Post, pick, replace, take, update } from 'demo';

export const extract = pick(['title', 'body']);
export const clean = update('body', replace(/<[^>]*>?/g, ''));
export const shorten = update('body', take(30));

const exerpts = (posts: Post[]) =>
  posts.map((post) => shorten(clean(extract(post))))
;
```

<big style="color: green">✔</big> Loop once, allocating only one new array

--

## Using compose 😁

```typescript
import { Post, compose, pipe } from 'demo';
import { extract, clean, shorten } from 'slide-5';

export type S = Pick<Post, 'title'|'body'>
export const summarize = compose<Post, S, S, S>(shorten, clean, extract);
// const _summarize = pipe<Post, S, S, S>(extract, clean, shorten);

const exerpts = (posts: Post[]) => posts.map(summarize);
```

<big style="color: green">✔</big> Semantic, concise & efficient

--

## Mixed operations ? 😵

```typescript
import { Post, whereEq } from 'demo';
import { summarize } from 'slide-6';

const myExerpts = (posts: Post[]) =>
  posts
    .filter(whereEq({ userId: 'me' }))
    .slice(0, 20)
    .map(summarize)
;
```

<big style="color: red">❌</big> Loop 2&times;, allocates 3 new array

--

## Combine predicates 😆

```typescript
import { Post, Predicate, every, some, whereEq } from 'demo';

type Logic = typeof every | typeof some;
export const pass = <T>(logic: Logic, predicates: Predicate<T>[]) => 
  (value: T) => logic(predicate => predicate(value), predicates)
;
export const first = (n: number) => () => n-- > 0;

const filter = pass<Post>(every, [whereEq({ userId:'me' }), first(20)]);
```

<big style="color: green">✔</big> Useful with all predicate operations: filter, find...

--
## Still no mixed operation 😵

```typescript
import { Post, every, whereEq } from 'demo';
import { summarize } from 'slide-6';
import { pass, first } from 'slide-8';

const userExerpts = (userId, n) => (posts: Post[]) =>
  posts
    .filter(pass(every, [whereEq({ userId }), first(n)]))
    .map(summarize)
;
const exerpts = userExerpts('me', 20);
```

<big style="color: red">❌</big> Loop 2&times;, allocates 2 new array

--

## Reduce all the things 😎

```typescript
import { Predicate, Mapper } from 'demo';

const append = <T>(l: T[], value: T) => (l.push(value), l);
const filter = <T>(predicate: Predicate<T>) =>
  (f: T[], value: T) => predicate(value) ? append(f, value) : f;
const take = <T>(n: number) =>
  (t: T[], value: T) => t.length < n ? append(t, value) : t;
const map = <T, U>(mapper: Mapper<T, U>) =>
  (m: U[], value: T) => append(m, mapper(value));
```

<big style="color: blue">‼</big> Implement every operation with 'reduce'

--

## Make it composable 🤪

```typescript
import { Predicate, Mapper, Reducer } from 'demo';
export const append = <T>(l: T[], value: T) => (l.push(value), l);
export const filter = <T>(predicate: Predicate<T>) =>
  (append: Reducer<T>) => 
    (f: T[], value: T) => predicate(value) ? append(f, value) : f;
export const take = <T>(n: number) =>
  (append: Reducer<T>) =>
    (t: T[], value: T) => t.length < n ? append(t, value) : t;
export const map = <T, U>(mapper: Mapper<T, U>) =>
  (append: Reducer<U>) =>
    (m: U[], value: T) => append(m, mapper(value));
```

<big style="color: blue">‼</big> Return unary reducer factory

--

## Compose reducers 😲

```typescript
import { Post, pipe, whereEq, Reducer } from 'demo';
import { summarize, S as Summary } from 'slide-6';
import { filter, take, map, append } from 'slide-11';
type R = Reducer<Post>;
const userExerpts = (userId: string, n: number) => (posts: Post[]) =>
  posts.reduce<Summary[]>(
    pipe<R, R, R, Reducer<Post, Summary[]>>(
      filter<Post>(whereEq({ userId })),
      take<Post>(n),
      map<Post, Summary>(summarize),
    )(append), []
  )
;
```

<big style="color: green">✔</big> Do you recognize rxjs pipe pattern ?

--

## Reusable transduce 🤑

```typescript
import { Reducer, reduce } from 'demo';

const transduce = <T = any, U = T>(
  transform: (x) => Reducer<T, U[]>,
  append,
  accumulator: U[],
  list: T[]
) =>
  reduce(transform(append), accumulator, list)
;
```

<big style="color: green">✔</big> Ok, but how to abstract list type ?

--

## Roll a generic reduce

```typescript
const reduce = (transformer, accumulator, iterator) => {
  let step = iterator.next();
  while (!step.done) {
    accumulator = transformer.step(accumulator, step.value);
    step = iterator.next();
  }
  return transformer.result(accumulator);
}
```

--

## Stop iteration

```typescript
const reduce = (transformer, accumulator, iterator) => {
  let step = iterator.next();
  while (!step.done) {
    accumulator = transformer.step(accumulator, step.value);
    if (accumulator && accumulator.reduced) {
      accumulator = accumulator.value;
      break;
    }
    step = iterator.next();
  }
  return transformer.result(accumulator);
}
```


<script type="text/javascript" src="https://unpkg.com/monaco-editor-core@0.12.0/dev/vs/loader.js"></script>
<script>
  require.config({ paths: {
    vs: 'https://unpkg.com/monaco-editor-core@0.12.0/min/vs',
    'vs/language/typescript': 'https://unpkg.com/monaco-typescript@3.1.0/release/min',
  }})
  // https://github.com/Microsoft/monaco-editor/blob/master/docs/integrate-amd-cross.md#option-1-use-a-data-worker-uri
  window.MonacoEnvironment = {
    getWorkerUrl(workerId, label) {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://unpkg.com/monaco-editor-core@0.12.0/min/',
          getWorkerUrl(moduleId, label) {
            if (label === 'typescript' || label === 'javascript')
              return 'https://unpkg.com/monaco-typescript@3.1.0/release/min/tsWorker.js'
          }
        }
        importScripts('https://unpkg.com/monaco-editor-core@0.12.0/min/vs/base/worker/workerMain.js')`
      )}`
    }
  }
  require([
    'vs/editor/editor.main',
    'theme/editor/editor'
  ], ({ editor, languages, Uri }, { iniEditor }) => {
    require([
      'vs/language/typescript/monaco.contribution',
      'https://unpkg.com/ramda@0.25.0/dist/ramda.min.js'
    ], (_, ramda) => {
      const src = (uri) => fetch(uri).then(response => response.text())
      Promise.all([
        src('https://unpkg.com/@types/ramda@0.25.40/index.d.ts'),
        src('demo.ts'),
      ])
      .then(([ramdaTypes, demo]) => {
        const { typescript } = languages
        typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        typescript.typescriptDefaults.setCompilerOptions({
          target: typescript.ScriptTarget.ES2018,
          moduleResolution: typescript.ModuleResolutionKind.NodeJs,
          module: typescript.ModuleKind.Classic,
          typeRoots: ['node_modules/@types'],
        })
        typescript.typescriptDefaults.addExtraLib(
          ramdaTypes,
          'node_modules/@types/ramda/index.d.ts',
        )
        typescript.typescriptDefaults.addExtraLib(
          demo,
          'node_modules/demo/index.d.ts',
        )
        const nodes = document.querySelectorAll('.slide pre')
        // const libs = [{
        //   uri: 'node_modules/ramda/index.ts',
        //   factory: () => eval(ramda),
        // }]
        const models = [
          // editor.createModel(demo, 'typescript', 'node_modules/demo/index.ts'),
        ]
        nodes.forEach((node, index) => {
          const { width, height } = node.getBoundingClientRect()
          node.style.width = `${width}px`
          node.style.height = `${height}px`
          const code = node.textContent.trim()
          node.innerHTML = ''
          const slide = node.closest('.slide').id
          const model = editor.createModel(code, 'typescript', `node_modules/${slide}/index.ts`)
          models.push(model)
          editor.create(node, {
            model,
            // readOnly: true,
            automaticLayout: true,
            language: 'typescript',
            minimap: { enabled: false },
            theme: 'vs-dark',
            renderLineHighlight: 'none',
            lineNumbersMinChars: 2,
            fontSize: 40,
            contextmenu: false,
            fontFamily: 'Inconsolata, monospace',
            wordWrap: 'on',
            scrollbar: { verticalScrollbarSize: 0 },
            scrollBeyondLastLine: false
          })
          const LINE_HEIGHT = 54
          const CONTAINER_GUTTER = 0
          const codeContainer = node.getElementsByClassName('view-lines')[0]
          let prevLineCount = 0
          model.onDidChangeContent(() => setTimeout(() => {
              const height =
                codeContainer.childElementCount > prevLineCount
                  ? codeContainer.offsetHeight // unfold
                  : codeContainer.childElementCount * LINE_HEIGHT + CONTAINER_GUTTER; // fold
              prevLineCount = codeContainer.childElementCount
              console.log(node, editor, height)
              node.style.height = height + 'px'
              editor.layout()
            }, 0))
          })

        // https://github.com/Microsoft/monaco-editor/issues/884#issuecomment-391706345
        typescript.getTypeScriptWorker()
          .then(() => iniEditor({ editor, languages }) )
/*
        function transpile(model) {
          console.log('transpile', model.uri)
          return this(model.uri)
            .then((client) => client.getEmitOutput(model.uri))
            .then(({ outputFiles }) => ({
              uri: model.uri,
              factory: new Function('require, exports', `${outputFiles[0].text}`)
            }))
        }
        typescript.getTypeScriptWorker()
          .then(worker => Promise.all(libs.concat(models.map(transpile, worker)))
            .then(modules => {
              const factories = modules
                .reduce((m, { uri, factory }) => ((m[uri] = factory), m), {})
              
              console.log('factories', factories, modules)
              const load = (factories) => {
                require.reset()
                Object.entries(factories)
                .forEach(([uri, factory]) => {
                  const name = uri.replace(/node_modules\/(.*?)\/index\.ts/, '$1')
                  define(name, ['require', 'exports'], factory)
                  console.log('define', name, factory)
                })
              }
              load(factories)
              models.forEach(model => model.onDidChangeContent(() => {
                const { uri, factory } = transpile.call(worker, model)
                factories[uri] = factory
                load(factories)
                console.log('change')
              }))
              console.log('ready')
            })
          )
//*/
      })
    })
  })
</script>
