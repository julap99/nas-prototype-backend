/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Create category table
    .createTable('k_profiling_kategori', (table) => {
      table.increments('id_profiling_kategori').primary();
      table.string('kod_kategori', 50).notNullable().unique();
      table.string('nama_kategori', 255).notNullable();
      table.text('keterangan').nullable();
      table.tinyint('status').defaultTo(1); // 1 = active, 0 = inactive
      table.timestamp('created_date').defaultTo(knex.fn.now());
      table.timestamp('updated_date').defaultTo(knex.fn.now());
      
      table.index('kod_kategori');
      table.index('status');
    })
    // Create process table
    .createTable('k_profiling_proses', (table) => {
      table.increments('id_profiling_proses').primary();
      table.string('kod_proses', 50).notNullable().unique();
      table.string('nama_proses', 255).notNullable();
      table.string('id_page', 1000).notNullable();
      table.text('keterangan').nullable();
      table.string('kod_kategori', 50).nullable();
      table.string('nama_kategori', 255).nullable();
      table.tinyint('status').defaultTo(1); // 1 = active, 0 = inactive
      table.timestamp('created_date').defaultTo(knex.fn.now());
      table.timestamp('updated_date').defaultTo(knex.fn.now());
      
      table.index('kod_proses');
      table.index('kod_kategori');
      table.index('status');
      
      // Foreign key reference to category table
      table.foreign('kod_kategori').references('kod_kategori').inTable('k_profiling_kategori').onDelete('SET NULL');
    })
    // Create component table
    .createTable('k_profiling_component', (table) => {
      table.increments('id_profiling_component').primary();
      table.string('kod_komponen', 50).notNullable().unique();
      table.string('nama_pendaftaran', 255).notNullable();
      table.text('description').nullable();
      table.json('kod_proses').nullable(); // JSON array of process codes
      table.tinyint('status').defaultTo(1); // 1 = active, 0 = inactive
      table.timestamp('created_date').defaultTo(knex.fn.now());
      table.timestamp('updated_date').defaultTo(knex.fn.now());
      
      table.index('kod_komponen');
      table.index('status');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('k_profiling_component')
    .dropTableIfExists('k_profiling_proses')
    .dropTableIfExists('k_profiling_kategori');
}; 