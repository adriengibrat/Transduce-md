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
const fn = (a, b, c) => a + b + c
assert(curry(fn)(1)(2)(3) === 6)
// assert(curry(fn)(1, 2)(3) === curry(fn)(1)(2, 3))
```

[Ramda](https://ramdajs.com/docs) & [lodash/fp](https://gist.github.com/jfmengels/6b973b69c491375117dc) docs

--

## Usual example 😪

<big style="color: red">❌</big> Loop 3&times;, allocating new array each time

```typescript
export const exerpts = (posts) => posts
  .map(pick('title', 'body'))
  .map(update('body', replace(/<[^>]*>?/g, '')))
  .map(update('body', truncate({ length: 17 })))
```

--

## Fusion 😃

<big style="color: green">✔</big> Loop once, allocating only one new array

```typescript
const extract = pick('title', 'body')
const clean = update('body', replace(/<[^>]*>?/g, ''))
const shorten = update('body', truncate({ length: 17 }))
export const exerpts = (posts) => posts
  .map((post) => shorten(clean(extract(post))))
```

--

## Using compose 😁

<big style="color: green">✔</big> Semantic, concise & efficient

```typescript
const summarize = compose(shorten, clean, extract)
// (post) => shorten(clean(extract(post))))
export const exerpts = map(summarize)
// (posts) => map(summarize, posts)
```

--

## More generic 😂

<big style="color: green">✔</big> Readable, efficient, reusable

```typescript
const fuse = curry((fns, a) => map(compose(...fns), a))
export const exerpts = fuse([shorten, clean, extract])
// (fns) => {
//   const fn = compose(...fns)
//   return (a) => map(fn, a)
// }
```

--

## Mixed operations ? 😵

<big style="color: red">❌</big> Loop 2&times;, allocates 3 new array

```typescript
const userExerpts = (userId, n) => (posts) => posts
  .filter(matches({ userId }))
  .slice(0, n)
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Combine predicates 😆

<big style="color: green">✔</big> Usable with filter, every, some, find, findIndex...

```typescript
const pass = curry((allOrAny, predicates) => 
  (value) => allOrAny(p => p(value), predicates))
const all = curry((p, a) => a.every(p))
const any = curry((p, a) => a.some(p))
const take = (n) => () => n-- > 0
// pass(every, [matches({ userId: 'me' }), take(20)])
```

--
## Still no mixed operations 😵

<big style="color: red">❌</big> Loop 2&times;, allocates 2 new array

```typescript
const passAll = pass(all)
const userExerpts = (userId, n) => (posts) => posts
  .filter(passAll([matches({ userId }), take(n)]))
  .map(summarize)
export const exerpts = userExerpts('me', 20)
```

--

## Disclosure: I <big style="color: red; vertical-align: sub;">❤</big> reduce 

```typescript
const sum = (result, value) => result + value
const total = [1, 2, 3, 4].reduce(sum, 0)
// 10 (0 + 1 + 2 + 3 + 4)
```

--

## Reduce all the things 😎

```typescript
const append = (value, a) => (a.push(value), a)
const filter = (predicate, a) => a.reduce((f, value) =>
  predicate(value) ? append(value, f) : f, [])
const take = (n, a) => a.reduce((t, value) =>
  t.length < n ? append(value, t) : t, [])
const map = (mapper, a) => a.reduce((m, value) =>
  append(mapper(value), m), [])
```

--

## Abstract reducers

```typescript
const filterReducer = (predicate) => (f, value) =>
  predicate(value) ? append(value, f) : f
const takeReducer = (n) => (t, value) =>
  t.length < n ? append(value, t) : t
const mapReducer = (mapper) => (m, value) =>
  append(mapper(value), m)
```

--

```typescript
const userExerpts = (userId, n) => (posts) => posts
.reduce(compose( // oh, rxjs pipe ;)
  filterReducer(matches({ userId })),
  takeReducer(n),
  mapReducer(summarize),
), [])
```

```typescript
const transduce = (input, init, reducers) =>
  input.reduce(compose(...reducers), init)
```