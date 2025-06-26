/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const bcrypt = require('bcrypt');
  
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Create hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const ekpPassword = await bcrypt.hash('ekp123', 10);
  const pkpPassword = await bcrypt.hash('pkp123', 10);
  const eoadPassword = await bcrypt.hash('eoad123', 10);
  const asnafPassword = await bcrypt.hash('asnaf123', 10);
  
  // Inserts seed entries with different roles
  await knex('users').insert([
    {
      email: 'admin@example.com',
      password: adminPassword,
      full_name: 'Super Administrator',
      role: 'superadmin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'ekp@example.com',
      password: ekpPassword,
      full_name: 'EKP User',
      role: 'ekp',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'pkp@example.com',
      password: pkpPassword,
      full_name: 'PKP User',
      role: 'pkp',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'eoad@example.com',
      password: eoadPassword,
      full_name: 'EOAD User',
      role: 'eoad',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'asnaf@example.com',
      password: asnafPassword,
      full_name: 'Asnaf User',
      role: 'asnaf',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}; 