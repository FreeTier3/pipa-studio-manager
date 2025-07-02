
import { DataStorage } from './storage';
import { queries } from './queries';
import type { PreparedStatement, QueryResult } from './types';

class InMemoryDatabase {
  private storage: DataStorage;

  constructor() {
    this.storage = new DataStorage();
    console.log('In-memory database initialized successfully');
  }

  prepare(query: string): PreparedStatement {
    return {
      all: (params?: any[]) => this.executeQuery(query, params || []),
      run: (params?: any[]) => this.executeInsert(query, params || []),
      get: (params?: any[]) => this.executeQuery(query, params || [])[0]
    };
  }

  exec(schema: string): void {
    console.log('Database schema initialized');
  }

  private executeQuery(query: string, params: any[]): any[] {
    const lowerQuery = query.toLowerCase();
    
    // Organizations
    if (lowerQuery.includes('select') && lowerQuery.includes('organizations')) {
      return this.storage.getTable('organizations');
    }
    
    // People queries
    if (lowerQuery.includes('select') && lowerQuery.includes('people')) {
      const people = this.storage.getTable('people');
      const allPeople = this.storage.getTable('people');
      
      return people
        .filter(person => !params[0] || person.organization_id === params[0])
        .map(person => ({
          ...person,
          manager_name: allPeople.find(p => p.id === person.manager_id)?.name,
          subordinates_count: allPeople.filter(p => p.manager_id === person.id).length,
          assets_count: this.storage.getTable('assets').filter(a => a.person_id === person.id).length,
          licenses_count: this.storage.getTable('license_seats').filter(ls => ls.person_id === person.id).length,
          documents_count: this.storage.getTable('documents').filter(d => d.person_id === person.id).length
        }));
    }
    
    // Teams
    if (lowerQuery.includes('select') && lowerQuery.includes('teams')) {
      const teams = this.storage.getTable('teams');
      return teams.filter(team => !params[0] || team.organization_id === params[0]);
    }
    
    // Licenses
    if (lowerQuery.includes('select') && lowerQuery.includes('licenses')) {
      const licenses = this.storage.getTable('licenses');
      return licenses
        .filter(license => !params[0] || license.organization_id === params[0])
        .map(license => ({
          ...license,
          used_seats: this.storage.getTable('license_seats')
            .filter(ls => ls.license_id === license.id && ls.person_id).length
        }));
    }
    
    // License seats
    if (lowerQuery.includes('select') && lowerQuery.includes('license_seats')) {
      const seats = this.storage.getTable('license_seats');
      const people = this.storage.getTable('people');
      
      return seats
        .filter(seat => !params[0] || seat.license_id === params[0])
        .map(seat => ({
          ...seat,
          person_name: people.find(p => p.id === seat.person_id)?.name
        }));
    }
    
    // Assets
    if (lowerQuery.includes('select') && lowerQuery.includes('assets')) {
      const assets = this.storage.getTable('assets');
      const people = this.storage.getTable('people');
      
      return assets
        .filter(asset => !params[0] || asset.organization_id === params[0])
        .map(asset => ({
          ...asset,
          person_name: people.find(p => p.id === asset.person_id)?.name
        }));
    }
    
    // Documents
    if (lowerQuery.includes('select') && lowerQuery.includes('documents')) {
      const documents = this.storage.getTable('documents');
      const people = this.storage.getTable('people');
      
      return documents
        .filter(doc => !params[0] || doc.organization_id === params[0])
        .map(doc => ({
          ...doc,
          person_name: people.find(p => p.id === doc.person_id)?.name
        }));
    }
    
    return [];
  }

  private executeInsert(query: string, params: any[]): QueryResult {
    const lowerQuery = query.toLowerCase();
    let lastInsertRowid = 0;
    let changes = 0;
    
    if (lowerQuery.includes('insert into organizations')) {
      lastInsertRowid = this.storage.insertIntoTable('organizations', {
        name: params[0]
      });
      changes = 1;
    } else if (lowerQuery.includes('update organizations')) {
      const success = this.storage.updateInTable('organizations', params[1], {
        name: params[0]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from organizations')) {
      const success = this.storage.deleteFromTable('organizations', params[0]);
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('insert into people')) {
      lastInsertRowid = this.storage.insertIntoTable('people', {
        organization_id: params[0],
        name: params[1],
        email: params[2],
        position: params[3],
        manager_id: params[4]
      });
      changes = 1;
    } else if (lowerQuery.includes('update people')) {
      const success = this.storage.updateInTable('people', params[4], {
        name: params[0],
        email: params[1],
        position: params[2],
        manager_id: params[3]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from people')) {
      const success = this.storage.deleteFromTable('people', params[0]);
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('insert into teams')) {
      lastInsertRowid = this.storage.insertIntoTable('teams', {
        organization_id: params[0],
        name: params[1]
      });
      changes = 1;
    } else if (lowerQuery.includes('update teams')) {
      const success = this.storage.updateInTable('teams', params[1], {
        name: params[0]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from teams')) {
      const success = this.storage.deleteFromTable('teams', params[0]);
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('insert into licenses')) {
      lastInsertRowid = this.storage.insertIntoTable('licenses', {
        organization_id: params[0],
        name: params[1],
        access_link: params[2],
        access_password: params[3],
        code: params[4],
        total_seats: params[5],
        expiry_date: params[6]
      });
      changes = 1;
    } else if (lowerQuery.includes('update licenses')) {
      const success = this.storage.updateInTable('licenses', params[6], {
        name: params[0],
        access_link: params[1],
        access_password: params[2],
        code: params[3],
        total_seats: params[4],
        expiry_date: params[5]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from licenses')) {
      const success = this.storage.deleteFromTable('licenses', params[0]);
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('insert into license_seats')) {
      lastInsertRowid = this.storage.insertIntoTable('license_seats', {
        license_id: params[0],
        person_id: params[1] || null,
        assigned_at: new Date().toISOString()
      });
      changes = 1;
    } else if (lowerQuery.includes('insert into assets')) {
      lastInsertRowid = this.storage.insertIntoTable('assets', {
        organization_id: params[0],
        name: params[1],
        serial_number: params[2],
        person_id: params[3]
      });
      changes = 1;
    } else if (lowerQuery.includes('update assets')) {
      const success = this.storage.updateInTable('assets', params[3], {
        name: params[0],
        serial_number: params[1],
        person_id: params[2]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from assets')) {
      const success = this.storage.deleteFromTable('assets', params[0]);
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('insert into documents')) {
      lastInsertRowid = this.storage.insertIntoTable('documents', {
        organization_id: params[0],
        name: params[1],
        file_path: params[2],
        person_id: params[3]
      });
      changes = 1;
    } else if (lowerQuery.includes('update documents')) {
      const success = this.storage.updateInTable('documents', params[3], {
        name: params[0],
        file_path: params[1],
        person_id: params[2]
      });
      changes = success ? 1 : 0;
    } else if (lowerQuery.includes('delete from documents')) {
      const success = this.storage.deleteFromTable('documents', params[0]);
      changes = success ? 1 : 0;
    }
    
    return { lastInsertRowid, changes };
  }

  close(): void {
    // Cleanup se necessário
  }
}

let db: InMemoryDatabase | null = null;

export const getDatabase = (): InMemoryDatabase => {
  if (!db) {
    db = new InMemoryDatabase();
  }
  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
