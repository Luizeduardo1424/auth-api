import { afterAll, beforeAll } from '@jest/globals';
import { pool } from '../src/database/pool';

beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
});

afterAll(async() => {
    await pool.end();
});