const db = require('../../config/db');

const getSystemData = async () => {
  const lecturers = await db('users')
    .where({ role: 'lecturer' })
    .select('id', 'name', 'university_id');
    
  const halls = await db('lecture_halls')
    .select('id', 'name', 'capacity');
    
  const subjects = await db('subjects')
    .select('id', 'subject_code', 'subject_name');

  return { lecturers, halls, subjects };
};

module.exports = { getSystemData };