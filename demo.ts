import { lensProp, over } from 'ramda'

export const update = <U = any, V = U>(prop: string, fn: Mapper<U, V>) => over(lensProp(prop), fn)

export { all as every, any as some, compose, pipe, curry, map, pick, replace, reduce, take, whereEq } from 'ramda'

export interface Post {
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

export interface Predicate<T = any> {
  (a: T): boolean
}

export interface Mapper<T = any, U = T> {
  (a: T): U
}

export interface Reducer<T = any, U = T[]> {
  (accumulator: U, value: T): U
}

export const assert = console.assert
