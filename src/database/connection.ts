
import Database from 'better-sqlite3';
import type { PreparedStatement, QueryResult } from './types';

class SQLiteDatabase {
  private db: Database.Database;

  constructor() {
    // Create in-memory SQLite database
    this.db = new Database(':memory:');
    this.initializeSchema();
    this.insertSampleData();
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
  }

  private insertSampleData(): void {
    // Insert default organization
    const orgStmt = this.db.prepare('INSERT OR IGNORE INTO organizations (id, name) VALUES (?, ?)');
    orgStmt.run(1, 'Pipa Studios');

    // Insert sample people
    const peopleStmt = this.db.prepare('INSERT OR IGNORE INTO people (id, organization_id, name, email, position) VALUES (?, ?, ?, ?, ?)');
    peopleStmt.run(1, 1, 'João Silva', 'joao@pipastudios.com', 'Desenvolvedor Senior');
    peopleStmt.run(2, 1, 'Maria Santos', 'maria@pipastudios.com', 'Designer UX/UI');
    peopleStmt.run(3, 1, 'Pedro Costa', 'pedro@pipastudios.com', 'Gerente de Projeto');

    // Insert sample teams
    const teamsStmt = this.db.prepare('INSERT OR IGNORE INTO teams (id, organization_id, name) VALUES (?, ?, ?)');
    teamsStmt.run(1, 1, 'Desenvolvimento');
    teamsStmt.run(2, 1, 'Design');

    // Insert team members
    const memberStmt = this.db.prepare('INSERT OR IGNORE INTO team_members (team_id, person_id) VALUES (?, ?)');
    memberStmt.run(1, 1); // João no time de Desenvolvimento
    memberStmt.run(1, 3); // Pedro no time de Desenvolvimento
    memberStmt.run(2, 2); // Maria no time de Design

    // Insert sample assets
    const assetsStmt = this.db.prepare('INSERT OR IGNORE INTO assets (id, organization_id, name, serial_number, person_id) VALUES (?, ?, ?, ?, ?)');
    assetsStmt.run(1, 1, 'MacBook Pro 16"', 'MB123456', 1);
    assetsStmt.run(2, 1, 'iPhone 15 Pro', 'IP789012', 2);
    assetsStmt.run(3, 1, 'Monitor Dell 27"', 'DL345678', 3);

    // Insert sample licenses
    const licensesStmt = this.db.prepare('INSERT OR IGNORE INTO licenses (id, organization_id, name, total_seats, expiry_date) VALUES (?, ?, ?, ?, ?)');
    licensesStmt.run(1, 1, 'Adobe Creative Suite', 5, '2024-12-31');
    licensesStmt.run(2, 1, 'JetBrains IntelliJ', 3, '2024-11-15');
    licensesStmt.run(3, 1, 'Figma Pro', 10, '2025-03-01');

    // Insert license seats
    const seatsStmt = this.db.prepare('INSERT OR IGNORE INTO license_seats (license_id, person_id) VALUES (?, ?)');
    seatsStmt.run(1, 2); // Maria usando Adobe Creative Suite
    seatsStmt.run(2, 1); // João usando JetBrains
    seatsStmt.run(3, 2); // Maria usando Figma Pro
    seatsStmt.run(3, 3); // Pedro usando Figma Pro

    console.log('Sample data inserted successfully');
  }

  prepare(query: string): PreparedStatement {
    const stmt = this.db.prepare(query);
    
    return {
      all: (params?: any[]) => {
        try {
          const result = stmt.all(...(params || []));
          console.log('Query executed:', query, 'Params:', params, 'Result:', result);
          return result;
        } catch (error) {
          console.error('Query error:', error, 'Query:', query, 'Params:', params);
          return [];
        }
      },
      run: (params?: any[]): QueryResult => {
        try {
          const result = stmt.run(...(params || []));
          console.log('Query executed:', query, 'Params:', params, 'Result:', result);
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
          const result = stmt.get(...(params || []));
          console.log('Query executed:', query, 'Params:', params, 'Result:', result);
          return result;
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
