import * as uuid from 'uuid/v1'
import { resolve } from 'path'
import { interval, timer, range, of } from 'rxjs'
import { delayWhen, flatMap, tap, map, concatMap, finalize } from 'rxjs/operators'

import { appendFileObs } from './utils/append-file'

const TPS = 15
const filePath = resolve(__dirname, '../../reports', `transactions_${(new Date()).getTime()}.log`)

export const singleReq = () => of(uuid())
  .pipe(
    tap((d) => console.time(d)),
    delayWhen(() => interval(Math.random() * 3000)),
    flatMap(uid => 
      appendFileObs(filePath, `${uid}\n`).pipe(map(() => uid))
    ),
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

// multiReq(10, 0).subscribe()
getMockedGenerateTransaction()
  .subscribe()