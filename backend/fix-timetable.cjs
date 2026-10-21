
  require('dotenv').config();
  const { Client } = require('pg');

  async function main() {
    const db = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await db.connect();

      // Get the first five subjects from the database
      const subjects = await db.query(
        'SELECT code FROM subjects ORDER BY code LIMIT 5'
      );

      if (subjects.rows.length < 5) {
        throw new Error(
          `Only ${subjects.rows.length} subjects found. At least 5 are required.`
        );
      }

      // Find the faculty user
      const faculty = await db.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        ['s.sharma@eng.university.edu']
      );

      const facultyId = faculty.rows[0]?.id ?? null;

      const days = [
        ['Monday', 1],
        ['Tuesday', 2],
        ['Wednesday', 3],
        ['Thursday', 4],
        ['Friday', 5],
        ['Saturday', 6]
      ];

      const times = [
        ['09:00', '10:00'],
        ['10:00', '11:00'],
        ['11:00', '12:00'],
        ['12:00', '13:00'],
        ['14:00', '15:00']
      ];

      let inserted = 0;

      for (const [day, dayIndex] of days) {
        for (let i = 0; i < subjects.rows.length; i++) {
          const subjectCode = subjects.rows[i].code;
          const [startTime, endTime] = times[i];

          const result = await db.query(
            `INSERT INTO timetable
              (day, day_index, start_time, end_time, subject_code,
              faculty_user_id, room, type)
            SELECT
              $1::varchar,
              $2::int,
              $3::time,
              $4::time,
              $5::varchar,
              $6::bigint,
              $7::varchar,
              'Lecture'
            WHERE NOT EXISTS (
              SELECT 1
              FROM timetable
              WHERE day = $1::varchar
                AND subject_code = $5::varchar
            )
            RETURNING id`,
            [
              day,
              dayIndex,
              startTime,
              endTime,
              subjectCode,
              facultyId,
              i === 2 ? 'Lab 1' : 'Room 101'
            ]
          );

          inserted += result.rowCount;
        }
      }

      // Show the number of lectures for each day
      const check = await db.query(
        `SELECT
          day,
          COUNT(*)::int AS lectures
        FROM timetable
        GROUP BY day_index, day
        ORDER BY day_index`
      );

      console.log('\nNew entries added:', inserted);
      console.log('\nTimetable entries by day:');
      console.table(check.rows);

      // Show the complete timetable
      const timetable = await db.query(
        `SELECT
          day,
          subject_code AS "subjectCode",
          to_char(start_time, 'HH24:MI') AS "startTime",
          to_char(end_time, 'HH24:MI') AS "endTime",
          room,
          type
        FROM timetable
        ORDER BY day_index, start_time`
      );

      console.log('\nComplete timetable:');
      console.table(timetable.rows);
    } catch (error) {
      console.error('\nERROR:', error.message);
      process.exitCode = 1;
    } finally {
      await db.end();
    }
  }

  main();