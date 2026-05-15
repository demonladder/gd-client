/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export type ClassProperties<C> = {
    [Key in keyof C as C[Key] extends Function ? never : Key]: C[Key];
};
