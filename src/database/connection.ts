
import Database from 'better-sqlite3';
import { queries } from './queries';
import type { PreparedStatement, QueryResult } from './types';

class SQLiteDatabase {
  private db: Database.Database;

  constructor() {
    // Create in-memory SQLite database
    this.db = new Database(':memory:');
    this.initializeSchema();
    console.log('SQLite database initialized successfully');
  }

  private initializeSchema(): void {
    // Organizations
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // People
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        position TEXT,
        manager_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (manager_id) REFERENCES people(id)
      );
    `);

    // Teams
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
      );
    `);

    // Team Members
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        person_id INTEGER NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id),
        FOREIGN KEY (person_id) REFERENCES people(id),
        UNIQUE(team_id, person_id)
      );
    `);

    // Licenses
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        access_link TEXT,
        access_password TEXT,
        code TEXT,
        total_seats INTEGER DEFAULT 1,
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
      );
    `);

    // License Seats
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS license_seats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_id INTEGER NOT NULL,
        person_id INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (license_id) REFERENCES licenses(id),
        FOREIGN KEY (person_id) REFERENCES people(id)
      );
    `);

    // Assets
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        serial_number TEXT,
        person_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (person_id) REFERENCES people(id)
      );
    `);

    // Documents
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        person_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (person_id) REFERENCES people(id)
      );
    `);

    // Insert default organization
    const stmt = this.db.prepare('INSERT OR IGNORE INTO organizations (id, name) VALUES (?, ?)');
    stmt.run(1, 'Pipa Studios');
  }

  prepare(query: string): PreparedStatement {
    const stmt = this.db.prepare(query);
    
    return {
      all: (params?: any[]) => {
        try {
          return stmt.all(...(params || []));
        } catch (error) {
          console.error('Query error:', error, 'Query:', query, 'Params:', params);
          return [];
        }
      },
      run: (params?: any[]): QueryResult => {
        try {
          const result = stmt.run(...(params || []));
          return {
            lastInsertRowid: result.lastInsertRowid as number,
            changes: result.changes
          };
        } catch (error) {
          console.error('Query error:', error, 'Query:', query, 'Params:', params);
          return { lastInsertRowid: 0, changes: 0 };
        }
      },
      get: (params?: any[]) => {
        try {
          return stmt.get(...(params || []));
        } catch (error) {
          console.error('Query error:', error, 'Query:', query, 'Params:', params);
          return undefined;
        }
      }
    };
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  close(): void {
    this.db.close();
  }
}

let db: SQLiteDatabase | null = null;

export const getDatabase = (): SQLiteDatabase => {
  if (!db) {
    db = new SQLiteDatabase();
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
