// export const generatePeriodicRequest = ()
// export const multiReq = (n: number, idx: number) => range(1, n)
//   .pipe(
//     flatMap(() => singleReq()),
//     finalize(() => console.log(`${idx}th multi req done`))
//   );

// export const getMockedGenerateTransaction = () => timer(0, 1000)
//   .pipe(
//     concatMap((idx) => multiReq(TPS, idx))
//   );