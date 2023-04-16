import { Observable } from "../observables/observable";
import {
  DiverterFn,
  Observer,
  OperatorFn,
} from "../types/observables-library-types";

/**
 * The tap() operator accepts a diverter function that can be used to perform operations on the source values. The
 * source value is passed on through a new observable unchanged.
 */
export function tap<T>(diverterFn: DiverterFn<T>): OperatorFn<T, T> {
  // Returns a function that takes an observable as an argument and returns a new observable.
  return (sourceObservable: Observable<T>) => {
    return new Observable<T>((nextObserver: Observer<T>) => {
      const subscriptionToSource$ = sourceObservable.subscribe({
        next: (sourceValue) => {
          let clonedSourceValue;

          try {
            // clone the source value to avoid mutating it
            clonedSourceValue = structuredClone(sourceValue);
          } catch (err) {
            nextObserver.error(
              `tap operator could not clone received value: ${err}`
            );
            return;
          }

          // use cloned value as the function argument that was originally passed into the tap() operator
          diverterFn(clonedSourceValue);

          // pass the original unmutated source value to the next observer in the pipeline
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
