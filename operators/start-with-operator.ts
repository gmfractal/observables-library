import { Observable } from "../observables/observable";
import { Observer, OperatorFn } from "../types/observables-library-types";

/**
 * The startWith() operator accepts a starting value as its sole argument and it will emit this as the first value. After that it will pass all future values along without mutating them.
 */
export function startWith<T>(startingValue: any): OperatorFn<T, T> {
  // flag contained in parent scope for tracking the emission state
  let hasEmittedStartingValue = false;

  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    return new Observable<T>((nextObserver: Observer<T>) => {
      // If the starting value has not been emitted yet then we know we are at the start of the stream and so the starting value should be emitted before doing anything else.
      if (hasEmittedStartingValue === false) {
        hasEmittedStartingValue = true;
        nextObserver.next(startingValue);
      }

      const subscriptionToSource$ = sourceObservable.subscribe({
        next: (sourceValue) => {
          // Pass the unmutated source value along
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
