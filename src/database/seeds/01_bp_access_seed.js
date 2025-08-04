const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('BP_access').del();

  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Inserts seed entries
  await knex('BP_access').insert([
    {
      username: 'admin',
      password: hashedPassword,
      isActive: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: 'thirdparty',
      password: hashedPassword,
      isActive: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}; 