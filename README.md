title: Transducers, powerful abstractions
author:
  name: I'm Adrien, frontend developer
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
import { curry } from 'ramda'
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
import { Post, propEq } from 'demo'
import { summarize } from 'slide-6'

const userExerpts = (userId: string, n: number) => (posts: Post[]) => posts
  .filter(propEq('userId', userId))
  .slice(0, n)
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Combine predicates 😆

<big style="color: green">✔</big> Useful with filter, every, some, find...

```typescript
import { Predicate, all, any, propEq } from 'demo'

export const pass = (logic: typeof all | typeof any, predicates: Predicate[]) => 
  (value) => logic(predicate => predicate(value), predicates)
export const first = (n: number) => () => n-- > 0
const filter = pass(all, [propEq('userId', 'me'), first(20)])
```

--
## Still no mixed operation 😵

<big style="color: red">❌</big> Loop 2&times;, allocates 2 new array

```typescript

import { Post, all, propEq } from 'demo'
import { summarize } from 'slide-6'
import { pass, first } from 'slide-8'

const userExerpts = (userId, n) => (posts: Post[]) => posts
  .filter(pass(all, [propEq({ userId }), first(n)]))
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Reduce all the things 😎

<big style="color: blue">‼</big> Implement all iteration operation with 'reduce'

```typescript
import { Predicate, Mapper } from 'demo'

export const append = <T>(value: T, a: T[]) => (a.push(value), a)
const filter = <T>(predicate: Predicate, a: T[]) => a.reduce<T[]>((f, value) =>
  predicate(value) ? append(value, f) : f, [])
const take = <T>(n: number, a: T[]) => a.reduce<T[]>((t, value) =>
  t.length < n ? append(value, t) : t, [])
const map = <T, U>(mapper: Mapper<T, U>, a: T[]) => a.reduce<U[]>((m, value) =>
  append(mapper(value), m), [])
```

--

## Abstract reducers

```typescript
import { Predicate, Mapper } from 'demo'
import { append } from 'slide-10'

export const filterReducer = (predicate: Predicate) => <T>(f: T[], value: T) =>
  predicate(value) ? append(value, f) : f
export const takeReducer = (n: number) => <T>(t: T[], value: T) =>
  t.length < n ? append(value, t) : t
export const mapReducer = <T, U>(mapper: Mapper<T, U>) => <T>(m: U[], value: T) =>
  append(mapper(value), m)
```

--

```typescript
import { Post, compose, propEq } from 'demo'
import { summarize } from 'slide-6'
import { filterReducer, takeReducer, mapReducer } from 'slide-11'

const userExerpts = (userId: string, n: number) => (posts: Post[]) => posts
.reduce(compose( // oh, rxjs pipe ;)
  filterReducer(propEq({ userId })),
  takeReducer(n),
  mapReducer(summarize),
), [])
```

--

```typescript
const transduce = (input, init, reducers) =>
  input.reduce(compose(...reducers), init)
```

<script type="text/javascript" src="https://unpkg.com/monaco-editor-core@0.12.0/min/vs/loader.js"></script>
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
    ], async () => {
      languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      })
      languages.typescript.typescriptDefaults.setCompilerOptions({
        target: languages.typescript.ScriptTarget.ES2018,
        allowNonTsExtensions: true,
        moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
        module: languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ['node_modules/@types'],
      })
      languages.typescript.typescriptDefaults.addExtraLib(
        await (await fetch('https://unpkg.com/@types/ramda@0.25.40/index.d.ts')).text(),
        'node_modules/@types/ramda/index.d.ts',
      )
      languages.typescript.typescriptDefaults.addExtraLib(
        await (await fetch('https://unpkg.com/@types/lodash@4.14.117/fp.d.ts')).text(),
        'node_modules/@types/lodash/fp.d.ts',
      )
      languages.typescript.typescriptDefaults.addExtraLib(`
export class Post {
    id: string
    userId: number
    date: Date
    title: string
    body: string
    categories: string[]
    comments: {
        userId: string
        comment: string
    }[]
}
export type Summary = Pick<Post, 'title'|'body'>

export interface Predicate {
    (a: any): boolean
}

export interface Mapper<T = any, U = T> {
    (a: T): U
}

export interface Reducer {
    (accumulator: any[], value: any): any[]
}

import { over, lensProp } from 'ramda'
export const update = <U = any, V = U>(prop: string, fn: Mapper<U, V>) => over(lensProp(prop), fn)

export { all, any, compose, curry, map, pick, replace, take, whereEq } from 'ramda'

declare const assert = console.assert
`,
        'node_modules/demo/index.d.ts',
      )
      const nodes = document.querySelectorAll('.slide pre')
      nodes.forEach((node, index) => {
          const { width, height } = node.getBoundingClientRect()
          node.style.width = `${width}px`
          node.style.height = `${height}px`
          const code = node.textContent
          node.innerHTML = ''
          const slide = node.closest('.slide').id
          const model = editor.createModel(code, 'typescript', `node_modules/${slide}/index.ts`)
          console.log(slide, node, width, height, model, code)
          node.editor = editor.create(node, {
            model,
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
      languages.typescript.getTypeScriptWorker()
        .then(() => iniEditor({ editor, languages }) )
      return nodes
    })
  })
</script>
