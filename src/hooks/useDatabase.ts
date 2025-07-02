import { useState, useEffect } from 'react';
import { getDatabase } from '../database/connection';
import type { 
  Organization, 
  Person, 
  Team, 
  License, 
  Asset, 
  Document, 
  DashboardStats,
  LicenseSeat 
} from '../types';

export const useDatabase = () => {
  const [currentOrganization, setCurrentOrganization] = useState<number>(1);

  // Organizations
  const getOrganizations = (): Organization[] => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM organizations ORDER BY name').all() as Organization[];
  };

  const addOrganization = (name: string) => {
    const db = getDatabase();
    const stmt = db.prepare('INSERT INTO organizations (name) VALUES (?)');
    return stmt.run([name]);
  };

  const updateOrganization = (id: number, name: string) => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE organizations SET name = ? WHERE id = ?');
    return stmt.run([name, id]);
  };

  const deleteOrganization = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM organizations WHERE id = ?');
    return stmt.run([id]);
  };

  // Dashboard
  const getDashboardStats = (): DashboardStats => {
    const db = getDatabase();
    
    const recent_people = db.prepare(`
      SELECT p.*, m.name as manager_name 
      FROM people p 
      LEFT JOIN people m ON p.manager_id = m.id 
      WHERE p.organization_id = ? 
      ORDER BY p.created_at DESC 
      LIMIT 5
    `).all([currentOrganization]) as Person[];

    const recent_assets = db.prepare(`
      SELECT a.*, p.name as person_name 
      FROM assets a 
      LEFT JOIN people p ON a.person_id = p.id 
      WHERE a.organization_id = ? 
      ORDER BY a.created_at DESC 
      LIMIT 5
    `).all([currentOrganization]) as Asset[];

    const expiring_licenses = db.prepare(`
      SELECT l.*, 
             (SELECT COUNT(*) FROM license_seats WHERE license_id = l.id AND person_id IS NOT NULL) as used_seats
      FROM licenses l 
      WHERE l.organization_id = ? 
        AND l.expiry_date IS NOT NULL 
        AND DATE(l.expiry_date) <= DATE('now', '+30 days')
      ORDER BY l.expiry_date ASC 
      LIMIT 5
    `).all([currentOrganization]) as License[];

    return { recent_people, recent_assets, expiring_licenses };
  };

  // People
  const getPeople = (): Person[] => {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*,
             m.name as manager_name,
             (SELECT COUNT(*) FROM people WHERE manager_id = p.id) as subordinates_count,
             (SELECT COUNT(*) FROM assets WHERE person_id = p.id) as assets_count,
             (SELECT COUNT(*) FROM license_seats WHERE person_id = p.id) as licenses_count,
             (SELECT COUNT(*) FROM documents WHERE person_id = p.id) as documents_count
      FROM people p
      LEFT JOIN people m ON p.manager_id = m.id
      WHERE p.organization_id = ?
      ORDER BY p.name
    `).all([currentOrganization]) as Person[];
  };

  const addPerson = (person: Omit<Person, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO people (organization_id, name, email, position, manager_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run([person.organization_id, person.name, person.email, person.position, person.manager_id]);
  };

  const updatePerson = (id: number, person: Partial<Omit<Person, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE people 
      SET name = COALESCE(?, name), 
          email = COALESCE(?, email), 
          position = COALESCE(?, position), 
          manager_id = COALESCE(?, manager_id)
      WHERE id = ?
    `);
    return stmt.run([person.name, person.email, person.position, person.manager_id, id]);
  };

  const deletePerson = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM people WHERE id = ?');
    return stmt.run([id]);
  };

  // Teams
  const getTeams = (): Team[] => {
    const db = getDatabase();
    const teams = db.prepare(`
      SELECT * FROM teams WHERE organization_id = ? ORDER BY name
    `).all([currentOrganization]) as Team[];

    return teams.map(team => ({
      ...team,
      members: db.prepare(`
        SELECT p.* FROM people p
        JOIN team_members tm ON p.id = tm.person_id
        WHERE tm.team_id = ?
        ORDER BY p.name
      `).all([team.id]) as Person[]
    }));
  };

  const addTeam = (name: string) => {
    const db = getDatabase();
    const stmt = db.prepare('INSERT INTO teams (organization_id, name) VALUES (?, ?)');
    return stmt.run([currentOrganization, name]);
  };

  const updateTeam = (id: number, name: string) => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE teams SET name = ? WHERE id = ?');
    return stmt.run([name, id]);
  };

  const deleteTeam = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM teams WHERE id = ?');
    return stmt.run([id]);
  };

  // Licenses
  const getLicenses = (): License[] => {
    const db = getDatabase();
    const licenses = db.prepare(`
      SELECT l.*,
             (SELECT COUNT(*) FROM license_seats WHERE license_id = l.id AND person_id IS NOT NULL) as used_seats
      FROM licenses l
      WHERE l.organization_id = ?
      ORDER BY l.name
    `).all([currentOrganization]) as License[];

    return licenses.map(license => ({
      ...license,
      seats: db.prepare(`
        SELECT ls.*, p.name as person_name
        FROM license_seats ls
        LEFT JOIN people p ON ls.person_id = p.id
        WHERE ls.license_id = ?
        ORDER BY ls.assigned_at
      `).all([license.id]) as LicenseSeat[]
    }));
  };

  const addLicense = (license: Omit<License, 'id' | 'created_at' | 'used_seats' | 'seats'>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO licenses (organization_id, name, access_link, access_password, code, total_seats, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run([
      license.organization_id, 
      license.name, 
      license.access_link, 
      license.access_password, 
      license.code, 
      license.total_seats, 
      license.expiry_date
    ]);
    
    // Criar seats vazios
    const seatStmt = db.prepare('INSERT INTO license_seats (license_id) VALUES (?)');
    for (let i = 0; i < license.total_seats; i++) {
      seatStmt.run([result.lastInsertRowid]);
    }
    
    return result;
  };

  const updateLicense = (id: number, license: Partial<Omit<License, 'id' | 'created_at' | 'used_seats' | 'seats'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE licenses 
      SET name = COALESCE(?, name), 
          access_link = COALESCE(?, access_link), 
          access_password = COALESCE(?, access_password), 
          code = COALESCE(?, code), 
          total_seats = COALESCE(?, total_seats), 
          expiry_date = COALESCE(?, expiry_date)
      WHERE id = ?
    `);
    return stmt.run([license.name, license.access_link, license.access_password, license.code, license.total_seats, license.expiry_date, id]);
  };

  const deleteLicense = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM licenses WHERE id = ?');
    return stmt.run([id]);
  };

  // Assets
  const getAssets = (): Asset[] => {
    const db = getDatabase();
    return db.prepare(`
      SELECT a.*, p.name as person_name
      FROM assets a
      LEFT JOIN people p ON a.person_id = p.id
      WHERE a.organization_id = ?
      ORDER BY a.name
    `).all([currentOrganization]) as Asset[];
  };

  const addAsset = (asset: Omit<Asset, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO assets (organization_id, name, serial_number, person_id)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run([asset.organization_id, asset.name, asset.serial_number, asset.person_id]);
  };

  const updateAsset = (id: number, asset: Partial<Omit<Asset, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE assets 
      SET name = COALESCE(?, name), 
          serial_number = COALESCE(?, serial_number), 
          person_id = COALESCE(?, person_id)
      WHERE id = ?
    `);
    return stmt.run([asset.name, asset.serial_number, asset.person_id, id]);
  };

  const deleteAsset = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM assets WHERE id = ?');
    return stmt.run([id]);
  };

  // Documents
  const getDocuments = (): Document[] => {
    const db = getDatabase();
    return db.prepare(`
      SELECT d.*, p.name as person_name
      FROM documents d
      LEFT JOIN people p ON d.person_id = p.id
      WHERE d.organization_id = ?
      ORDER BY d.name
    `).all([currentOrganization]) as Document[];
  };

  const addDocument = (document: Omit<Document, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO documents (organization_id, name, file_path, person_id)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run([document.organization_id, document.name, document.file_path, document.person_id]);
  };

  const uploadDocument = (file: File, personId?: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Simular upload para localStorage (em produção seria para um servidor)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const fileName = `${Date.now()}_${file.name}`;
          localStorage.setItem(`document_${fileName}`, result);
          resolve(fileName);
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateDocument = (id: number, document: Partial<Omit<Document, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE documents 
      SET name = COALESCE(?, name), 
          file_path = COALESCE(?, file_path), 
          person_id = COALESCE(?, person_id)
      WHERE id = ?
    `);
    return stmt.run([document.name, document.file_path, document.person_id, id]);
  };

  const deleteDocument = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
    return stmt.run([id]);
  };

  return {
    currentOrganization,
    setCurrentOrganization,
    getOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    getDashboardStats,
    getPeople,
    addPerson,
    updatePerson,
    deletePerson,
    getTeams,
    addTeam,
    updateTeam,
    deleteTeam,
    getLicenses,
    addLicense,
    updateLicense,
    deleteLicense,
    getAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    getDocuments,
    addDocument,
    uploadDocument,
    updateDocument,
    deleteDocument
  };
};
