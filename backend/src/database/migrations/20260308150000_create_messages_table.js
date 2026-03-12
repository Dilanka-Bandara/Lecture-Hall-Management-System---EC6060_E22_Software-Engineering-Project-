exports.up = function(knex) {
  return knex.schema.createTable('messages', table => {
    table.increments('id').primary();
    table.integer('sender_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.integer('receiver_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.text('message').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('messages');
};