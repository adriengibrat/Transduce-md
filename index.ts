import { all, any, compose, curry, lensProp, map, over, pick, replace, take, whereEq } from 'ramda'

declare class Post {
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
declare type Summary = Pick<Post, 'title' | 'body'>
declare interface Predicate {
    (a: any): boolean
}
declare interface Mapper<T = any,U = T> {
    (a: T): U
}
declare interface Reducer {
    (accumulator: any[], value: any): any[]
}

const fn = (a: number, b: number, c: number) => a + b + c
const result = curry(fn)(1)(2)(3)
console.assert(result === 6); console.assert(curry(fn)(1, 2)(3) === curry(fn)(1)(2, 3))


export const update = (prop: string, fn: Mapper) =>
  over(lensProp(prop), fn)
export const exerpts = (posts: Post[]) => posts
  .map(pick(['title', 'body']))
  .map(update('body', replace(/<[^>]*>?/g, '')))
  .map(update('body', take(17)))


export const extract = pick(['title', 'body'])
export const clean = update('body', replace(/<[^>]*>?/g, ''))
export const shorten = update('body', take(17))
export const exerpts2 = (posts: Post[]) => posts
  .map((post) => shorten(clean(extract(post))))


export const summarize = compose<Post, Summary, Summary, Summary>(shorten, clean, extract)
export const exerpts3 = (posts: Post[]) => map(summarize, posts)


const fuse = <T>(fns: Mapper<T>[], list: T[]) => map(compose(...fns), list)
export const exerpts4 = (posts: Post[]) => fuse([shorten, clean, extract], posts)


const userExerpts = (userId: string, n: number) => (posts: Post[]) => posts
  .filter(whereEq({ userId }))
  .slice(0, n)
  .map(summarize)
export const exerpts5 = userExerpts('me', 20)

type Logic = typeof all | typeof any
const pass = curry((logic: Logic, predicates: Predicate[]) => 
  (value) => logic(predicate => predicate(value), predicates))
const first = (n: number) => () => n-- > 0
const filter = pass(all, [whereEq({ userId: 'me' }), first(20)])

const passAll = pass(all)
const userExerpts2 = (userId, n) => (posts: Post[]) => posts
  .filter(passAll([whereEq({ userId }), first(n)]))
  .map(summarize)
export const exerpts6 = userExerpts('me', 20)


const sum = (result, value) => result + value
const total = [1, 2, 3, 4].reduce(sum, 0)


const append = (value: any, a: any[]) => (a.push(value), a)
const filterReduce = (predicate: Predicate, a: any[]) => a.reduce<any[]>((f, value) =>
  predicate(value) ? append(value, f) : f, [])
const takeReduce = (n: number, a: any[]) => a.reduce<any[]>((t, value) =>
  t.length < n ? append(value, t) : t, [])
const mapReduce = (mapper, a: any[]) => a.reduce<any[]>((m, value) =>
  append(mapper(value), m), [])


const filterReducer = (predicate: Predicate) => (f: any[], value: any) =>
  predicate(value) ? append(value, f) : f
const takeReducer = (n: number) => (t: any[], value: any) =>
  t.length < n ? append(value, t) : t
const mapReducer = (mapper) => (m: any[], value: any) =>
  append(mapper(value), m)


const userExerpts3 = (userId: string, n: number) => (posts: Post[]) => posts
  .reduce(compose( // oh, rxjs pipe ;)
    filterReducer(whereEq({ userId })),
    takeReducer(n),
    mapReducer(summarize),
  ), [])


const transduce = <T>(transducer: Reducer, init: T[], input: any[]) =>
  input.reduce<T[]>(transducer, init)
const userExerpts4 = (userId: string, n: number) => (posts: Post[]) => 
    transduce(compose(
        filterReducer(whereEq({ userId })),
        takeReducer(n),
        mapReducer(summarize),
      ), [], posts)