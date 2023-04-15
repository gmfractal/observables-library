import { Observable } from "../observables/observable";
import { Observer, OperatorFn } from "../types/observables-library-types";

/**
 * The skip() operator accepts a number as the limit argument. It will track the number of emissions from the source observable and only allow values to continue down the pipeline AFTER the limit has been reached.
 */
export function skip<T>(limit: number): OperatorFn<T, T> {
  const _limit = Math.round(limit); // Round limit to the nearest integer in case a float was passed in
  let _emissionCounter = 0;

  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    return new Observable<T>((nextObserver: Observer<T>) => {
      const subscriptionToSource$ = sourceObservable.subscribe({
        next: (sourceValue) => {
          // Only increment the counter if it is below the limit. Continuing to count after the limit has been reached will only waste resources.
          if (_emissionCounter < _limit) {
            _emissionCounter += 1;
            return;
          }

          // Once the emission count has surpassed the limit, pass the original unmutated source value to the next observer in the pipeline
          nextObserver.next(sourceValue);
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
