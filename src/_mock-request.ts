const uuid = require('uuid/v1')
// @ts-ignore
import { interval, timer, range, of } from 'rxjs'
// @ts-ignore
import { delayWhen, flatMap, tap, concatMap, finalize } from 'rxjs/operators'
// @ts-ignore
const TPS = 15

export const singleReq = () => of(uuid())
  .pipe(
    tap((d) => console.time(d)),
    delayWhen(() => interval(Math.random() * 3000)),
    tap((d) => console.timeEnd(d))
  );

export const multiReq = (n: number, idx: number) => range(1, n)
  .pipe(
    flatMap(() => singleReq()),
    finalize(() => console.log(`${idx}th multi req done`))
  );

export const getMockedGenerateTransaction = () => timer(0, 1000)
  .pipe(
    concatMap((idx) => multiReq(TPS, idx))
  );

// getMockedGenerateTransaction()
//   .subscribe()