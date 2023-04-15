import {
  CleanUpFn,
  Observer,
  OperatorFn,
  ProducerFn,
  Subscription,
} from "../types/observables-library-types";

/**
 * Create a new observable by instantiating this class with a producer function for generating value(s) to be emitted
 */
export class Observable<T> {
  private _unsubscribed = false;

  private _producerFn: ProducerFn<T>;

  // this is intended to be an unstoppable clean up function for use within this class
  private _cleanUpFn: CleanUpFn = () => {};

  // Constructor takes a Producer function that is responsible for generating the values to be emitted by the observable and also returns a clean-up function that will be executed when the unsubscribe method is called. The clean-up function can be used to remove event listeners, stop any further API calls, etc.
  constructor(producerFn: ProducerFn<T>) {
    // Store the Producer function within the instantiated Observable object so that it can be executed when the subscribe() method is called.
    this._producerFn = producerFn;
  }

  // Within this class, there is a private _unsubscribed property which is a flag to track whether the unsubscribe() method has been called on this observable. If unsubscribed() has been called, we should not make any further calls on the observer's methods (next, error, completed). To achieve this functionality, the createStoppableObserver() method will create a new observer object by wrapping all of the methods from the source observer with a function that respects the _unsubscribed flag. If the flag is false (i.e. unsubscribe() has not been called), then the method of the source observable is executed. If the flag is true, then we know unsubscribe() has already been called and we do not make any further calls on those observer methods.
  private createStoppableObserver(sourceObserver: Observer<T>): Observer<T> {
    const stoppableObserver: Observer<T> = {
      next: (emittedValue: T) => {
        if (!!this._unsubscribed) return;

        sourceObserver.next(emittedValue);
      },
      error: (error: any) => {
        if (!!this._unsubscribed) return;

        this._unsubscribed = true;
        sourceObserver.error(error);
        this._cleanUpFn();
      },
      completed: () => {
        if (!!this._unsubscribed) return;
        this._unsubscribed = true;
        sourceObserver.completed();
        this._cleanUpFn();
      },
    };

    return stoppableObserver;
  }

  // Similar to the createStoppableObserver() method, we need to create a stoppable clean up function that can be indirectly executed from outside the observable object whenever unsubscribe() is called. We want the function to be stoppable because it has to respect the _unsubscribed flag within this observable class. If the flag is true, then the clean up function is not executed. If it's false, then we set the flag to true and then execute the clean up function. This way we effectively allow unsubscribe() to be called only once because any further calls of the method will have no effect.
  private createStoppableCleanUpFn(originalCleanUpFn: CleanUpFn): CleanUpFn {
    return () => {
      if (!!this._unsubscribed) return;
      this._unsubscribed = true;
      originalCleanUpFn();
    };
  }

  // When the subscribe() method is called, the Producer function is executed and the Observable will start generating values. Remember that calling the Producer function also returns the clean-up function. We hold a reference to that original unstoppable clean up method within this class for private/internal use. We also create a stoppable version of the clean up function by running it through the createStoppableCleanUpFn() method. The stoppable clean-up function is placed inside an object and assigned to the unsubscribe() method and returned. This way, unsubscribe() can be called externally to invoke the (stoppable) clean-up function.
  subscribe(observer: Observer<T>): Subscription {
    const stoppableObserver: Observer<T> =
      this.createStoppableObserver(observer);

    this._cleanUpFn = this._producerFn(stoppableObserver);

    const stoppableCleanUpFn = this.createStoppableCleanUpFn(this._cleanUpFn);

    return {
      unsubscribe: stoppableCleanUpFn,
    };
  }

  // pipe() accepts operators that can be used to transform or work with data emitted by the primary observable. In general, the pipe() method works by building a pipeline of function that subscribe to a source observable (either the first observable or the previous observable in the pipeline), using or transforming the data emitted by the source observable and returning a new observable that will pass the manipulated data down to the next observer in the pipeline.
  pipe(...operatorFns: OperatorFn<any, any>[]): Observable<any> {
    const finalObservableInPipeline = operatorFns.reduce(
      (sourceObservable, operatorFn) => {
        return operatorFn(sourceObservable);
      },
      this as any
    );

    return finalObservableInPipeline;
  }
}
