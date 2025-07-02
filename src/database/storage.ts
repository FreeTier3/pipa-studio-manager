// This file is now deprecated in favor of direct SQLite operations
// Keeping it for backward compatibility but it's no longer used

export class DataStorage {
  constructor() {
    console.warn('DataStorage class is deprecated. Using SQLite directly now.');
  }

  // Stub methods for backward compatibility
  getTable(): any[] { return []; }
  insertIntoTable(): number { return 0; }
  updateInTable(): boolean { return false; }
  deleteFromTable(): boolean { return false; }
  clearAll(): void {}
}
