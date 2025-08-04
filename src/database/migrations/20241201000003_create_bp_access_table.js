/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('BP_access', (table) => {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.boolean('isActive').defaultTo(true);
    table.timestamps(true, true);
    
    // Add indexes for better performance
    table.index('username');
    table.index('isActive');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('BP_access');
}; 