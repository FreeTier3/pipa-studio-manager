
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export const getDatabase = () => {
  if (!db) {
    db = new Database('./database.sqlite');
    
    // Executar schema
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);
    
    console.log('Database initialized successfully');
  }
  
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};
