import { Observable } from "../observables/observable";

export interface Observer<T> {
  next: (emittedValue: T) => void;
  error: (error: any) => void;
  completed: () => void;
}

export type CleanUpFn = () => void;

export type ProducerFn<T> = (observer: Observer<T>) => CleanUpFn;

export interface Subscription {
  unsubscribe: CleanUpFn;
}

export type TransformationFn<T, R> = (emittedValue: T) => R;

export type PredicateFn<T> = (emittedValue: T) => boolean;

export type DiverterFn<T> = (emittedValue: T) => void;

export type OperatorFn<T, R> = (
  sourceObservable: Observable<T>
) => Observable<R>;

export type TransformationOperator<T, R> = (
  transformationFn: TransformationFn<T, R>
) => OperatorFn<T, R>;

export type PredicateOperator<T> = (
  predicateFn: PredicateFn<T>
) => Observable<T>;

export type Operator<T, R> =
  | TransformationOperator<T, R>
  | PredicateOperator<T>
  | DiverterOperator<T>;
