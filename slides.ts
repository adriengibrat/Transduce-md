import { pipe } from 'ramda';

export { pipe, reduce } from 'ramda'
export const add = (a: number) => (b: number) => a + b;
export const double = (a: number) => a * 2;
export const odd = (a: number) => !!(a % 2)
export const compute = pipe(add(1), double, add(-1));
export const first = (n: number) => () => n-- > 0;
export const pass = (logic: 'every' | 'some', predicates: Function[]) => 
  (value) => predicates[logic](predicate => predicate(value))
;
interface Predicate {
  (a: any): boolean
}

interface Mapper<A = number, M = A> {
  (a: A): M
}

interface Reducer<A = number[]> {
  (accumulator: A, value: any): A
}
export const filter = (predicate: Predicate) => (append: Reducer): Reducer => 
  (list: number[], value) => predicate(value) ? append(list, value) : list
;
export const take = (n: number) => (append: Reducer): Reducer => 
  (list: number[], value) => list.length < n ? append(list, value) : list
;
export const map = (mapper: Mapper) => (append: Reducer): Reducer =>
  (list: number[], value) => append(list, mapper(value))
;
export const append: Reducer =
  (list: number[], value) => { list.push(value); return list; };