// export function isEmpty(o) {
//   for (const i in o) {
//     if (o.hasOwnProperty(i)) {
//       return false;
//     }
//   }
//   return true;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty(obj: any) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
