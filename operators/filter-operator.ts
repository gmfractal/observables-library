import { Observable } from "../observables/observable";
import {
  Observer,
  OperatorFn,
  PredicateFn,
} from "../types/observables-library-types";

/**
 * The filter() operator accepts a predicate function that is used to test values emitted by the source observable. If
 *  the predicate function returns a truthy result, the value is passed on, otherwise it is ignored and not passed on.
 */
export function filter<T>(predicateFn: PredicateFn<T>): OperatorFn<T, T> {
  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    // This is the new observable to be returned. When the new observable is instantiated, we also define its producer function at the same time where data from the source observable is filtered using the prediate function and emitted through the new observable if the predicate function returns a truthy value.
    return new Observable<T>((nextObserver: Observer<T>) => {
      const subscriptionToSource$ = sourceObservable.subscribe({
        next: (sourceValue) => {
          // Test the sourceValue with the predicate function. If the result is truthy, then pass the emitted value to the next observer, otherwise ignore it without passing it on.
          if (!!predicateFn(sourceValue)) {
            nextObserver.next(sourceValue);
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
