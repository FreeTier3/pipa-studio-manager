
export interface DatabaseTable {
  [key: string]: any[];
}

export interface QueryResult {
  lastInsertRowid: number;
  changes: number;
}

export interface PreparedStatement {
  all: (params?: any[]) => any[];
  run: (params?: any[]) => QueryResult;
  get: (params?: any[]) => any;
}
