/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('k_asnaf_documents', (table) => {
    table.increments('id_asnaf_document').primary();
    table.string('asnaf_uuid', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('filename', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.integer('file_size').notNullable();
    table.string('mime_type', 100).notNullable();
    table.string('document_type', 100).nullable(); // e.g., 'id_card', 'income_proof', etc.
    table.text('description').nullable();
    table.integer('status').defaultTo(1); // 1 = active, 0 = inactive
    table.timestamp('created_date').defaultTo(knex.fn.now());
    table.timestamp('updated_date').defaultTo(knex.fn.now());

    // Indexes
    table.index('asnaf_uuid');
    table.index('document_type');
    table.index('status');

    // Foreign key reference to asnaf profiling table
    table.foreign('asnaf_uuid').references('asnaf_uuid').inTable('k_asnaf_profiling');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('k_asnaf_documents');
}; 