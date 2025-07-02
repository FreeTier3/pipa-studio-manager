
export const queries = {
  // Organizations
  organizations: {
    selectAll: 'SELECT * FROM organizations ORDER BY name',
    insert: 'INSERT INTO organizations (name) VALUES (?)',
    update: 'UPDATE organizations SET name = ? WHERE id = ?',
    delete: 'DELETE FROM organizations WHERE id = ?'
  },

  // People
  people: {
    selectByOrg: `
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
    `,
    selectRecent: `
      SELECT p.*, m.name as manager_name 
      FROM people p 
      LEFT JOIN people m ON p.manager_id = m.id 
      WHERE p.organization_id = ? 
      ORDER BY p.created_at DESC 
      LIMIT 5
    `,
    insert: 'INSERT INTO people (organization_id, name, email, position, manager_id) VALUES (?, ?, ?, ?, ?)',
    update: 'UPDATE people SET name = COALESCE(?, name), email = COALESCE(?, email), position = COALESCE(?, position), manager_id = COALESCE(?, manager_id) WHERE id = ?',
    delete: 'DELETE FROM people WHERE id = ?'
  },

  // Teams
  teams: {
    selectByOrg: 'SELECT * FROM teams WHERE organization_id = ? ORDER BY name',
    selectMembers: 'SELECT p.* FROM people p JOIN team_members tm ON p.id = tm.person_id WHERE tm.team_id = ? ORDER BY p.name',
    insert: 'INSERT INTO teams (organization_id, name) VALUES (?, ?)',
    update: 'UPDATE teams SET name = ? WHERE id = ?',
    delete: 'DELETE FROM teams WHERE id = ?'
  },

  // Licenses
  licenses: {
    selectByOrg: `
      SELECT l.*,
             (SELECT COUNT(*) FROM license_seats WHERE license_id = l.id AND person_id IS NOT NULL) as used_seats
      FROM licenses l
      WHERE l.organization_id = ?
      ORDER BY l.name
    `,
    selectExpiring: `
      SELECT l.*, 
             (SELECT COUNT(*) FROM license_seats WHERE license_id = l.id AND person_id IS NOT NULL) as used_seats
      FROM licenses l 
      WHERE l.organization_id = ? 
        AND l.expiry_date IS NOT NULL 
        AND DATE(l.expiry_date) <= DATE('now', '+30 days')
      ORDER BY l.expiry_date ASC 
      LIMIT 5
    `,
    selectSeats: 'SELECT ls.*, p.name as person_name FROM license_seats ls LEFT JOIN people p ON ls.person_id = p.id WHERE ls.license_id = ? ORDER BY ls.assigned_at',
    insert: 'INSERT INTO licenses (organization_id, name, access_link, access_password, code, total_seats, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    insertSeat: 'INSERT INTO license_seats (license_id, person_id) VALUES (?, ?)',
    update: 'UPDATE licenses SET name = COALESCE(?, name), access_link = COALESCE(?, access_link), access_password = COALESCE(?, access_password), code = COALESCE(?, code), total_seats = COALESCE(?, total_seats), expiry_date = COALESCE(?, expiry_date) WHERE id = ?',
    delete: 'DELETE FROM licenses WHERE id = ?'
  },

  // Assets
  assets: {
    selectByOrg: 'SELECT a.*, p.name as person_name FROM assets a LEFT JOIN people p ON a.person_id = p.id WHERE a.organization_id = ? ORDER BY a.name',
    selectRecent: 'SELECT a.*, p.name as person_name FROM assets a LEFT JOIN people p ON a.person_id = p.id WHERE a.organization_id = ? ORDER BY a.created_at DESC LIMIT 5',
    insert: 'INSERT INTO assets (organization_id, name, serial_number, person_id) VALUES (?, ?, ?, ?)',
    update: 'UPDATE assets SET name = COALESCE(?, name), serial_number = COALESCE(?, serial_number), person_id = COALESCE(?, person_id) WHERE id = ?',
    delete: 'DELETE FROM assets WHERE id = ?'
  },

  // Documents
  documents: {
    selectByOrg: 'SELECT d.*, p.name as person_name FROM documents d LEFT JOIN people p ON d.person_id = p.id WHERE d.organization_id = ? ORDER BY d.name',
    insert: 'INSERT INTO documents (organization_id, name, file_path, person_id) VALUES (?, ?, ?, ?)',
    update: 'UPDATE documents SET name = COALESCE(?, name), file_path = COALESCE(?, file_path), person_id = COALESCE(?, person_id) WHERE id = ?',
    delete: 'DELETE FROM documents WHERE id = ?'
  }
};
