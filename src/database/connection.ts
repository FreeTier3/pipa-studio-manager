
// Simulação de dados em memória para frontend
// Em produção, isso seria substituído por uma API backend com SQLite real

interface DatabaseTable {
  [key: string]: any[];
}

class InMemoryDatabase {
  private data: DatabaseTable = {
    organizations: [
      { id: 1, name: 'Pipa Studios', created_at: new Date().toISOString() }
    ],
    people: [],
    teams: [],
    team_members: [],
    licenses: [],
    license_seats: [],
    assets: [],
    documents: []
  };

  prepare(query: string) {
    return {
      all: (params?: any[]) => this.executeQuery(query, params || []),
      run: (params?: any[]) => this.executeInsert(query, params || [])
    };
  }

  exec(schema: string) {
    // Schema já está inicializado com dados padrão
    console.log('Database schema initialized');
  }

  private executeQuery(query: string, params: any[]): any[] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('select') && lowerQuery.includes('organizations')) {
      return this.data.organizations;
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('people')) {
      return this.data.people.map(person => ({
        ...person,
        manager_name: this.data.people.find(p => p.id === person.manager_id)?.name,
        subordinates_count: this.data.people.filter(p => p.manager_id === person.id).length,
        assets_count: this.data.assets.filter(a => a.person_id === person.id).length,
        licenses_count: this.data.license_seats.filter(ls => ls.person_id === person.id).length,
        documents_count: this.data.documents.filter(d => d.person_id === person.id).length
      }));
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('teams')) {
      return this.data.teams;
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('licenses')) {
      return this.data.licenses.map(license => ({
        ...license,
        used_seats: this.data.license_seats.filter(ls => ls.license_id === license.id && ls.person_id).length
      }));
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('license_seats')) {
      return this.data.license_seats.map(seat => ({
        ...seat,
        person_name: this.data.people.find(p => p.id === seat.person_id)?.name
      }));
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('assets')) {
      return this.data.assets.map(asset => ({
        ...asset,
        person_name: this.data.people.find(p => p.id === asset.person_id)?.name
      }));
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('documents')) {
      return this.data.documents.map(doc => ({
        ...doc,
        person_name: this.data.people.find(p => p.id === doc.person_id)?.name
      }));
    }
    
    return [];
  }

  private executeInsert(query: string, params: any[]): { lastInsertRowid: number } {
    const lowerQuery = query.toLowerCase();
    const id = Date.now() + Math.floor(Math.random() * 1000);
    
    if (lowerQuery.includes('insert into people')) {
      this.data.people.push({
        id,
        organization_id: params[0],
        name: params[1],
        email: params[2],
        position: params[3],
        manager_id: params[4],
        created_at: new Date().toISOString()
      });
    } else if (lowerQuery.includes('insert into teams')) {
      this.data.teams.push({
        id,
        organization_id: params[0],
        name: params[1],
        created_at: new Date().toISOString()
      });
    } else if (lowerQuery.includes('insert into licenses')) {
      this.data.licenses.push({
        id,
        organization_id: params[0],
        name: params[1],
        access_link: params[2],
        access_password: params[3],
        code: params[4],
        total_seats: params[5],
        expiry_date: params[6],
        created_at: new Date().toISOString()
      });
    } else if (lowerQuery.includes('insert into license_seats')) {
      this.data.license_seats.push({
        id,
        license_id: params[0],
        person_id: params[1] || null,
        assigned_at: new Date().toISOString()
      });
    } else if (lowerQuery.includes('insert into assets')) {
      this.data.assets.push({
        id,
        organization_id: params[0],
        name: params[1],
        serial_number: params[2],
        person_id: params[3],
        created_at: new Date().toISOString()
      });
    } else if (lowerQuery.includes('insert into documents')) {
      this.data.documents.push({
        id,
        organization_id: params[0],
        name: params[1],
        file_path: params[2],
        person_id: params[3],
        created_at: new Date().toISOString()
      });
    }
    
    return { lastInsertRowid: id };
  }

  close() {
    // Cleanup se necessário
  }
}

let db: InMemoryDatabase | null = null;

export const getDatabase = () => {
  if (!db) {
    db = new InMemoryDatabase();
    console.log('In-memory database initialized successfully');
  }
  
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};
