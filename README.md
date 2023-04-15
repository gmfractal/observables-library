# Observables Library

This is a library that mimics the basic functionality of the RxJS library created for learning purposes. It includes an Observable class for creating observables and 3 operators: tap, map, and filter. Observable instances can be subscribed and unsubscribed to. Obsrvables also have a `pipe()` method that can be used with the operators.

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
    .pipe(
      // use the tap operator to intercept the emitted values and do something with it without mutating the value before passing it on
      tap((v) => console.log("A new value was emitted")),
      // map operator adds 100 to every emitted value
      map((v) => v + 100),
      // filter prevent any odd number from being passed on
      filter((v) => v % 2 === 0)
    )
    .subscribe({
      next: (num) => {
        console.log(num);
      },
      error: (error) => {
        console.error(error);
      },
      completed: () => {
        console.log("Done");
      },
    });

  // After 30s we unsubscribed from the observable's data stream by calling unsubscribe() which executes the clean up function
  setTimeout(() => {
    sub$.unsubscribe();
  }, 30_000);
```

## Results:

<img width="737" alt="image" src="https://user-images.githubusercontent.com/85326434/232184255-69c5e2c9-88d6-4ad7-83a5-2dae37e3acab.png">
