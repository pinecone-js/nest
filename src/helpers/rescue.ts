export function rescue(fn: Function) {
  try {
    fn();
  } catch (error) {}
}
