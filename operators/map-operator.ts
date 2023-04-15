import { Observable } from "../observables/observable";
import {
  Observer,
  OperatorFn,
  TransformationFn,
} from "../types/observables-library-types";

/**
 * The map() operator accepts a transformation function that defines how data from the source observable will be
 * transformed or used within the operator. The manipulated data is then passed on through a new observable. map()
 * returns a function that takes the source observable as an argument and the function itself returns a new observable.
 */
export function map<T, R>(
  transformationFn: TransformationFn<T, R>
): OperatorFn<T, R> {
  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    // This is the new observable to be returned. When the new observable is instantiated, we also define its producer function at the same time where data from the source observable is manipulated before being emitted through the new observable.
    return new Observable<R>((nextObserver: Observer<R>) => {
      const subscriptionToSource$ = sourceObservable.subscribe({
        // Use the transformation function to alter values emitted from the source observable then emit it by calling the next() method from the observer that is next in the pipeline
        next: (sourceValue) => nextObserver.next(transformationFn(sourceValue)),
        error: (error) => nextObserver.error(error),
        completed: () => nextObserver.completed(),
      });

      // Clean up function for the new observable is returned
      return () => {
        subscriptionToSource$.unsubscribe();
      };
    });
  };
}
