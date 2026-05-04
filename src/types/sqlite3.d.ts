declare module 'sqlite3' {
  type RunCallback = (this: Statement, err: Error | null) => void;

  class Statement {
    run(...params: unknown[]): Statement;
    run(...params: [...unknown[], RunCallback]): Statement;
    finalize(callback?: (err: Error | null) => void): void;
  }

  export class Database {
    constructor(filename: string, callback?: (err: Error | null) => void);
    exec(sql: string, callback?: (err: Error | null) => void): void;
    prepare(sql: string): Statement;
    serialize(callback: () => void): void;
    get(
      sql: string,
      params: unknown[],
      callback: (err: Error | null, row: Record<string, unknown> | undefined) => void,
    ): void;
  }
}
