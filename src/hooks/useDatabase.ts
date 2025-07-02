import { useState } from 'react';
import { getDatabase } from '../database/connection';
import { queries } from '../database/queries';
import type { 
  Organization, 
  Person, 
  Team, 
  License, 
  Asset, 
  Document, 
  DashboardStats,
  LicenseSeat 
} from '../database/types';

export const useDatabase = () => {
  const [currentOrganization, setCurrentOrganization] = useState<number>(1);

  // Organizations
  const getOrganizations = (): Organization[] => {
    console.log('Getting organizations...');
    const db = getDatabase();
    const result = db.prepare(queries.organizations.selectAll).all() as Organization[];
    console.log('Organizations result:', result);
    return result;
  };

  const addOrganization = (name: string) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.organizations.insert);
    return stmt.run([name]);
  };

  const updateOrganization = (id: number, name: string) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.organizations.update);
    return stmt.run([name, id]);
  };

  const deleteOrganization = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.organizations.delete);
    return stmt.run([id]);
  };

  // Dashboard
  const getDashboardStats = (): DashboardStats => {
    console.log('Getting dashboard stats for organization:', currentOrganization);
    const db = getDatabase();
    
    const recent_people = db.prepare(queries.people.selectRecent).all([currentOrganization]) as Person[];
    console.log('Recent people:', recent_people);
    
    const recent_assets = db.prepare(queries.assets.selectRecent).all([currentOrganization]) as Asset[];
    console.log('Recent assets:', recent_assets);
    
    const expiring_licenses = db.prepare(queries.licenses.selectExpiring).all([currentOrganization]) as License[];
    console.log('Expiring licenses:', expiring_licenses);

    const stats = { recent_people, recent_assets, expiring_licenses };
    console.log('Final dashboard stats:', stats);
    return stats;
  };

  const getPeople = (): Person[] => {
    const db = getDatabase();
    return db.prepare(queries.people.selectByOrg).all([currentOrganization]) as Person[];
  };

  const addPerson = (person: Omit<Person, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.people.insert);
    return stmt.run([person.organization_id, person.name, person.email, person.position, person.manager_id]);
  };

  const updatePerson = (id: number, person: Partial<Omit<Person, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.people.update);
    return stmt.run([person.name, person.email, person.position, person.manager_id, id]);
  };

  const deletePerson = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.people.delete);
    return stmt.run([id]);
  };

  const getTeams = (): Team[] => {
    const db = getDatabase();
    const teams = db.prepare(queries.teams.selectByOrg).all([currentOrganization]) as Team[];

    return teams.map(team => ({
      ...team,
      members: db.prepare(queries.teams.selectMembers).all([team.id]) as Person[]
    }));
  };

  const addTeam = (name: string) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.teams.insert);
    return stmt.run([currentOrganization, name]);
  };

  const updateTeam = (id: number, name: string) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.teams.update);
    return stmt.run([name, id]);
  };

  const deleteTeam = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.teams.delete);
    return stmt.run([id]);
  };

  const getLicenses = (): License[] => {
    const db = getDatabase();
    const licenses = db.prepare(queries.licenses.selectByOrg).all([currentOrganization]) as License[];

    return licenses.map(license => ({
      ...license,
      seats: db.prepare(queries.licenses.selectSeats).all([license.id]) as LicenseSeat[]
    }));
  };

  const addLicense = (license: Omit<License, 'id' | 'created_at' | 'used_seats' | 'seats'>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.licenses.insert);
    const result = stmt.run([
      license.organization_id, 
      license.name, 
      license.access_link, 
      license.access_password, 
      license.code, 
      license.total_seats, 
      license.expiry_date
    ]);
    
    const seatStmt = db.prepare(queries.licenses.insertSeat);
    for (let i = 0; i < license.total_seats; i++) {
      seatStmt.run([result.lastInsertRowid, null]);
    }
    
    return result;
  };

  const updateLicense = (id: number, license: Partial<Omit<License, 'id' | 'created_at' | 'used_seats' | 'seats'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.licenses.update);
    return stmt.run([license.name, license.access_link, license.access_password, license.code, license.total_seats, license.expiry_date, id]);
  };

  const deleteLicense = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.licenses.delete);
    return stmt.run([id]);
  };

  const getAssets = (): Asset[] => {
    const db = getDatabase();
    return db.prepare(queries.assets.selectByOrg).all([currentOrganization]) as Asset[];
  };

  const addAsset = (asset: Omit<Asset, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.assets.insert);
    return stmt.run([asset.organization_id, asset.name, asset.serial_number, asset.person_id]);
  };

  const updateAsset = (id: number, asset: Partial<Omit<Asset, 'id' | 'created_at'>>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.assets.update);
    return stmt.run([asset.name, asset.serial_number, asset.person_id, id]);
  };

  const deleteAsset = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.assets.delete);
    return stmt.run([id]);
  };

  const getDocuments = (): Document[] => {
    const db = getDatabase();
    return db.prepare(queries.documents.selectByOrg).all([currentOrganization]) as Document[];
  };

  const addDocument = (document: Omit<Document, 'id' | 'created_at'>) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.documents.insert);
    return stmt.run([document.organization_id, document.name, document.file_path, document.person_id]);
  };

  const uploadDocument = (file: File, personId?: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
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
    const stmt = db.prepare(queries.documents.update);
    return stmt.run([document.name, document.file_path, document.person_id, id]);
  };

  const deleteDocument = (id: number) => {
    const db = getDatabase();
    const stmt = db.prepare(queries.documents.delete);
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
