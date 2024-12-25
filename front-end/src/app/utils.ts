export function watchObject(
  obj: any,
  callback: (prop: string, value: any) => void
): any {
  return new Proxy(obj, {
    set(target, prop, value) {
      target[prop] = value;
      callback(prop as string, value);
      return true;
    },
  });
}
