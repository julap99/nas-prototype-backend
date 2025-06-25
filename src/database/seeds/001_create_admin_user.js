const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Inserts seed entries
  await knex('users').insert([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'Admin User',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}; 