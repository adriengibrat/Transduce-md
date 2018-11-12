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

<center>![Oodrive](theme/img/logo.svg)</center>

--

## Transducers 𝍏

> <cite>[clojure.org](https://clojure.org/reference/transducers)</cite>
compose transformations <br>without awareness of input <br>nor creation of intermediate aggregates

<small style="float:left">in physics *convert energy to signal*</small>

<small style="float:right">in biology *transfer genetic material*</small>

--

## Foreword, curry ♨

> <dfn title="Function that takes one or more functions as arguments / returns a function">[Higher-order function](https://www.youtube.com/watch?v=BMUiFMZr7vk)</dfn> that transform <br><dfn title="Function with exactly n arguments">[n-ary function](https://xlinux.nist.gov/dads/HTML/naryfunc.html)</dfn> to a chain of *n* <dfn title="Function that takes one argument">[unary function](https://xlinux.nist.gov/dads/HTML/unaryfunc.html)</dfn>

```typescript
import { curry, assert } from 'demo'
const fn = (a: number, b: number, c: number) => a + b + c
const result = curry(fn)(1)(2)(3) // 6
assert(curry(fn)(1, 2)(3) === curry(fn)(1)(2, 3), 'pragmatic curry ;)')
```
[Ramda](https://ramdajs.com/docs) & [lodash/fp](https://gist.github.com/jfmengels/6b973b69c491375117dc) docs

--

## Usual example 😪

<big style="color: red">❌</big> Loop 3&times;, allocating new array each time

```typescript
import { Post, pick, replace, take, update } from 'demo'

export const exerpts = (posts: Post[]) => posts
  .map(pick(['title', 'body']))
  .map(update('body', replace(/<[^>]*>?/g, '')))
  .map(update('body', take<string>(17)))
```

--

## Fusion 😃

<big style="color: green">✔</big> Loop once, allocating only one new array

```typescript
import { Post, pick, replace, take, update } from 'demo'

export const extract = pick(['title', 'body'])
export const clean = update('body', replace(/<[^>]*>?/g, ''))
export const shorten = update('body', take(17))

export const exerpts = (posts: Post[]) => posts
  .map((post) => shorten(clean(extract(post))))
```

--

## Using compose 😁

<big style="color: green">✔</big> Semantic, concise & efficient

```typescript
import { Post, Summary as S, compose, map } from 'demo'
import { extract, clean, shorten } from 'slide-5'

export const summarize = compose<Post, S, S, S>(shorten, clean, extract)
export const exerpts = (posts: Post[]) => map(summarize, posts)
```

--

## Mixed operations ? 😵

<big style="color: red">❌</big> Loop 2&times;, allocates 3 new array

```typescript
import { Post, whereEq } from 'demo'
import { summarize } from 'slide-6'

const userExerpts = (userId: string, n: number) => (posts: Post[]) => posts
  .filter(whereEq({ userId }))
  .slice(0, n)
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Combine predicates 😆

<big style="color: green">✔</big> Useful with filter, every, some, find...

```typescript
import { Post, Predicate, all, any, whereEq } from 'demo'

export const pass = <T>(logic: typeof all | typeof any, predicates: Predicate<T>[]) => 
  (value: T) => logic(predicate => predicate(value), predicates)
export const first = (n: number) => () => n-- > 0
const filter = pass<Post>(all, [whereEq({ userId:'me' }), first(20)])
```

--
## Still no mixed operation 😵

<big style="color: red">❌</big> Loop 2&times;, allocates 2 new array

```typescript
import { Post, all, whereEq } from 'demo'
import { summarize } from 'slide-6'
import { pass, first } from 'slide-8'

const userExerpts = (userId, n) => (posts: Post[]) => posts
  .filter(pass(all, [whereEq({ userId }), first(n)]))
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Reduce all the things 😎

<big style="color: blue">‼</big> Implement all iteration operations with 'reduce'

```typescript
import { Predicate, Mapper } from 'demo'

export const append = <T>(value: T, a: T[]) => (a.push(value), a)
const filter = <T>(predicate: Predicate<T>, a: T[]) =>
  a.reduce<T[]>((f, value) => predicate(value) ? append(value, f) : f, [])
const take = <T>(n: number, a: T[]) =>
  a.reduce<T[]>((taken, value) => t.length < n ? append(value, taken) : taken, [])
const map = <T, U>(mapper: Mapper<T, U>, a: T[]) =>
  a.reduce<U[]>((mapped, value) => append(mapper(value), mapped), [])
```

--

## Abstract reducers 😔

<big style="color: blue">‼</big> Reducer factories

```typescript
import { Predicate, Mapper } from 'demo'
import { append } from 'slide-10'

export const filterReducer = <T>(predicate: Predicate<T>) =>
  (filtered: T[], value: T) => predicate(value) ? append(value, filtered) : filtered
export const takeReducer = <T>(n: number) =>
  (taken: T[], value: T) => t.length < n ? append(value, taken) : taken
export const mapReducer = <T, U>(mapper: Mapper<T, U>) =>
  (mapped: U[], value: T) => append(mapper(value), mapped)
```

--
## Compose reducers 😲

<big style="color: green">✔</big> oh, rxjs pipe ;)

```typescript
import { Post, Summary, compose, whereEq } from 'demo'
import { summarize } from 'slide-6'
import { filterReducer, takeReducer, mapReducer } from 'slide-11'

const userExerpts = (userId: string, n: number) => (posts: Post[]) => posts
.reduce<Summary[]>(
  a = compose<Post, Summary, Summary, Summary>(
    filterReducer<Summary>(whereEq({ userId })),
    takeReducer<Summary>(n),
    mapReducer<Post, Summary>(summarize),
  ), [])
```

--

```typescript
const transduce = (input, init, reducers) =>
  input.reduce(compose(...reducers), init)
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
        src('index.ts'),
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
          const code = node.textContent
          node.innerHTML = ''
          const slide = node.closest('.slide').id
          const model = editor.createModel(code, 'typescript', `node_modules/${slide}/index.ts`)
          models.push(model)
          editor.create(node, {
            model,
            readOnly: true,
            language: 'typescript',
            minimap: { enabled: false },
            theme: 'vs-dark',
            renderLineHighlight: 'none',
            lineNumbersMinChars: 2,
            fontSize: 25,
            contextmenu: false,
            fontFamily: 'Inconsolata, monospace',
            wordWrap: 'on',
            scrollbar: { verticalScrollbarSize: 0 }
          })
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
