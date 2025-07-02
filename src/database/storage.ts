
interface StorageData {
  organizations: any[];
  people: any[];
  teams: any[];
  team_members: any[];
  licenses: any[];
  license_seats: any[];
  assets: any[];
  documents: any[];
}

const STORAGE_KEY = 'pipa_studios_data';

export class DataStorage {
  private data: StorageData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): StorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }

    // Dados padrão se não houver nada no storage
    return {
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
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  getTable(tableName: keyof StorageData): any[] {
    return this.data[tableName] || [];
  }

  insertIntoTable(tableName: keyof StorageData, record: any): number {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newRecord = {
      ...record,
      id,
      created_at: record.created_at || new Date().toISOString()
    };
    
    this.data[tableName].push(newRecord);
    this.saveToStorage();
    return id;
  }

  updateInTable(tableName: keyof StorageData, id: number, updates: any): boolean {
    const index = this.data[tableName].findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[tableName][index] = { ...this.data[tableName][index], ...updates };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteFromTable(tableName: keyof StorageData, id: number): boolean {
    const originalLength = this.data[tableName].length;
    this.data[tableName] = this.data[tableName].filter(item => item.id !== id);
    
    if (this.data[tableName].length < originalLength) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  clearAll(): void {
    this.data = {
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
    this.saveToStorage();
  }
}
