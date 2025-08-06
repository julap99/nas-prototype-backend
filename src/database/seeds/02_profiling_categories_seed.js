/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('k_profiling_kategori').del();

  // Inserts seed entries
  await knex('k_profiling_kategori').insert([
    {
      kod_kategori: 'CAT-20241216-001',
      nama_kategori: 'User Management',
      keterangan: 'Processes related to user account management, authentication, and authorization',
      status: 1,
      created_date: new Date(),
      updated_date: new Date(),
    },
    {
      kod_kategori: 'CAT-20241216-002',
      nama_kategori: 'Data Entry',
      keterangan: 'Processes for entering and managing data in the system',
      status: 1,
      created_date: new Date(),
      updated_date: new Date(),
    },
    {
      kod_kategori: 'CAT-20241216-003',
      nama_kategori: 'Reporting',
      keterangan: 'Processes for generating reports and analytics',
      status: 1,
      created_date: new Date(),
      updated_date: new Date(),
    },
    {
      kod_kategori: 'CAT-20241216-004',
      nama_kategori: 'Configuration',
      keterangan: 'System configuration and setup processes',
      status: 1,
      created_date: new Date(),
      updated_date: new Date(),
    },
    {
      kod_kategori: 'CAT-20241216-005',
      nama_kategori: 'Administration',
      keterangan: 'Administrative processes and system management',
      status: 1,
      created_date: new Date(),
      updated_date: new Date(),
    },
  ]);
}; 