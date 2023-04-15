import { Observable } from "../observables/observable";
import { Observer, OperatorFn } from "../types/observables-library-types";

/**
 * The take() operator accepts a number as the limit argument and it will permit values to be emitted for a number of times up to the limit. Once the limit has been reached, it will unsubscribe to stop any further values from being emitted.
 */
export function take<T>(limit: number): OperatorFn<T, T> {
  const _limit = Math.round(limit); // Round limit to the nearest integer in case a float was passed in
  let _emissionCounter = 0;

  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    return new Observable<T>((nextObserver: Observer<T>) => {
      const subscriptionToSource$ = sourceObservable.subscribe({
        next: (sourceValue) => {
          _emissionCounter += 1;

          // If we are below or at the limit, pass the original unmutated source value to the next observer in the pipeline
          if (_emissionCounter <= _limit) {
            nextObserver.next(sourceValue);
          }

          // If we are at the limit, then unsubscribe to prevent any further values from being emitted and call completed method on the next observer in the pipeline
          if (_emissionCounter === _limit) {
            subscriptionToSource$.unsubscribe();
            nextObserver.completed();
          }
        },
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
