# Observables Library

This is a library that reimplements the basic functionality of observables and operators and was inspired by RxJS. It includes an Observable class for creating observables and a few commonly used operators. Observable instances can be subscribed and unsubscribed to. Obsrvables also have a `pipe()` method that can be used with the operators. The following operators are available and function similarly to the RxJS operators of the same name:

- filter (https://rxjs.dev/api/index/function/filter)
- map (https://rxjs.dev/api/operators/map)
- tap (https://rxjs.dev/api/index/function/tap)
- startWith (https://rxjs.dev/api/index/function/startWith)
- take (https://rxjs.dev/api/index/function/take)
- skip (https://rxjs.dev/api/index/function/skip)

```

// USAGE EXAMPLE

// Create a new observable with a producer function that emits a number starting from 0 that increments by 1 every 1s
const sub$ = new Observable<number>((observer) => {
  let num = 0;
  const interval = setInterval(() => {
    observer.next(num);
    num += 1;
  }, 1000);

  // producer function returns a clean up function that stops the number-generating stream
  return () => {
    clearInterval(interval);
  };
})
  // use the pipe() method of the observable to create a pipeline for manipulating emitted values with operators
  .pipe(
    // use the tap operator to intercept the emitted values and do something with it without mutating the value before passing it on (side effects can be performed with emitted value even though this example doesn't do that)
    tap((val) => console.log("A new value was emitted")),
    // use the skip operator to skip the first 4 emitted values
    skip(4),
    // use the take operator to take 30 emitted values and then unsubscribe from the stream. Note that operator ordering matters. Since take() is used after skip(), take() will only start receiving values and starting its count after skipping the first 4 values.
    take(30),
    // map operator adds 100 to every emitted value
    map((val) => val + 100),
    // filter operator used to filter out any odd values
    filter((val) => val % 2 === 0),
    // the startWith operator is used to set the starting value of the stream. Note that operator ordering in the pipeline matters to achieve the desired results. For example, if the startWith operator is not placed at the end of this pipeline, it will not work.
    startWith(
      "This is the default starting value. The regular data stream will follow now."
    )
  )
  .subscribe({
    next: (val) => {
      console.log(val);
    },
    error: (error) => {
      console.error(error);
    },
    completed: () => {
      console.log("Completed was called, the data stream has finished.");
    },
  });

```

## Results:

<img width="567" alt="image" src="https://user-images.githubusercontent.com/85326434/232247317-04b69354-5b19-4ad4-aa04-3001f92cfec7.png">
