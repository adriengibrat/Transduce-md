import { pipe } from 'ramda';

export { compose, pipe, reduce } from 'ramda'
export const add = (a: number) => (b: number) => a + b;
export const add1 = add(1);
export const minus1 = add(-1);
export const double = (a: number) => a * 2;
export const odd = (a: number) => !!(a % 2);
export const gt = (a: number) => (b: number) => b > a;
export const gt2 = gt(2);
export const compute = pipe(add(1), double, add(-1));
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
export const append: Reducer =
  (list: number[], value) => { list.push(value); return list; }
;
export const noop: Reducer<any> =
  (list: number, value) => list;
;
export const map = (mapper: Mapper) => (append: Reducer): Reducer =>
  (list: number[], value) => append(list, mapper(value))
;
export const filter = (predicate: Predicate) => (append: Reducer): Reducer => 
  (list: number[], value) => predicate(value) ? append(list, value) : list
;
export const find = (predicate: Predicate) => (): Reducer<number|null> => 
  (list: number, value) => predicate(value) ? value : list
;