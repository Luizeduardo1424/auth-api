import request from 'supertest';
import app from '../../src/app';
import { pool } from '../../src/database/pool';
import { beforeEach, describe, it, expect } from '@jest/globals';

beforeEach(async () => {
  await pool.query('DELETE FROM refresh_tokens');
  await pool.query('DELETE FROM users');
});

describe('POST /api/v1/auth/register', () => {
  const validPayload = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Test1234',
  };

  it('should register a user and return 201 with tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(validPayload.email);
  });

  it('should return 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'invalido', username: 'a', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  it('should return 409 for duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validPayload);
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test1234',
    });
  });

  it('should login and return 200 with tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Test1234' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nope@example.com', password: 'Test1234' });

    expect(res.status).toBe(401);
  });
});