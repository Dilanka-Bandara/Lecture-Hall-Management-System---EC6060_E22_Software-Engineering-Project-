exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('university_id').notNullable().unique();
      table.string('role').notNullable(); // 'student', 'lecturer', 'hod', 'technical_officer', 'admin'
      table.string('batch');
      table.string('password_hash').notNullable();
    })
    .createTable('lecture_halls', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.integer('capacity').notNullable();
      table.boolean('has_projector').defaultTo(true);
    })
    .createTable('subjects', table => {
      table.increments('id').primary();
      table.string('subject_code').notNullable().unique();
      table.string('subject_name').notNullable();
    })
    .createTable('student_subjects', table => {
      table.integer('student_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
      table.primary(['student_id', 'subject_id']);
    })
    .createTable('timetables', table => {
      table.increments('id').primary();
      table.date('date').notNullable();
      table.time('start_time').notNullable();
      table.time('end_time').notNullable();
      table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
      table.integer('hall_id').unsigned().references('id').inTable('lecture_halls').onDelete('CASCADE');
      table.integer('lecturer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    })
    .createTable('attendance', table => {
      table.integer('timetable_id').unsigned().references('id').inTable('timetables').onDelete('CASCADE');
      table.integer('student_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.boolean('is_present').defaultTo(false);
      table.primary(['timetable_id', 'student_id']);
    })
    .createTable('swap_requests', table => {
      table.increments('id').primary();
      table.integer('timetable_id').unsigned().references('id').inTable('timetables').onDelete('CASCADE');
      table.integer('requesting_lecturer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('target_lecturer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.date('proposed_date').notNullable();
      table.time('proposed_start_time').notNullable();
      table.time('proposed_end_time').notNullable();
      table.integer('proposed_hall_id').unsigned().references('id').inTable('lecture_halls').onDelete('CASCADE');
      table.string('target_lecturer_status').defaultTo('pending'); 
      table.string('hod_status').defaultTo('pending'); 
    })
    .createTable('issues', table => {
      table.increments('id').primary();
      table.integer('hall_id').unsigned().references('id').inTable('lecture_halls').onDelete('CASCADE');
      table.integer('reported_by').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('equipment_type').notNullable();
      table.text('description').notNullable();
      table.string('status').defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('notifications', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('message').notNullable();
      table.boolean('is_read').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .dropTableIfExists('issues')
    .dropTableIfExists('swap_requests')
    .dropTableIfExists('attendance')
    .dropTableIfExists('timetables')
    .dropTableIfExists('student_subjects')
    .dropTableIfExists('subjects')
    .dropTableIfExists('lecture_halls')
    .dropTableIfExists('users');
};