
export interface Organization {
  id: number;
  name: string;
  created_at: string;
}

export interface Person {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  position?: string;
  manager_id?: number;
  manager_name?: string;
  subordinates_count?: number;
  assets_count?: number;
  licenses_count?: number;
  documents_count?: number;
  created_at: string;
}

export interface Team {
  id: number;
  organization_id: number;
  name: string;
  members: Person[];
  created_at: string;
}

export interface License {
  id: number;
  organization_id: number;
  name: string;
  access_link?: string;
  access_password?: string;
  code?: string;
  total_seats: number;
  used_seats?: number;
  expiry_date?: string;
  seats: LicenseSeat[];
  created_at: string;
}

export interface LicenseSeat {
  id: number;
  license_id: number;
  person_id?: number;
  person_name?: string;
  assigned_at: string;
}

export interface Asset {
  id: number;
  organization_id: number;
  name: string;
  serial_number?: string;
  person_id?: number;
  person_name?: string;
  created_at: string;
}

export interface Document {
  id: number;
  organization_id: number;
  name: string;
  file_path: string;
  person_id?: number;
  person_name?: string;
  created_at: string;
}

export interface DashboardStats {
  recent_people: Person[];
  recent_assets: Asset[];
  expiring_licenses: License[];
}

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
