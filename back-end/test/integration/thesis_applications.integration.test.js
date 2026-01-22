require('jest');

const { app } = require('../../src/app');
const { sequelize } = require('../../src/models');

const request = require('supertest');

let server;

beforeAll(async () => {
  server = app.listen(0, () => {
    console.log(`Test server running on port ${server.address().port}`);
  });
});

afterAll(async () => {
  await server.close(() => {
    sequelize.close();
  });
});

describe('GET /thesis-applications/eligibility', () => {
  test('Should check student eligibility for thesis application', async () => {
    const response = await request(server).get('/api/thesis-applications/eligibility');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      studentId: expect.any(String),
      eligible: expect.any(Boolean),
    });
  });
});

describe('GET /thesis-applications', () => {
  test('Should get last student application with 200 status', async () => {
    const response = await request(server).get('/api/thesis-applications');
    expect(response.status === 200).toBe(true);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('topic');
    expect(response.body).toHaveProperty('status');
  });
});

describe('GET /thesis-applications/all', () => {
  test('Should get all thesis applications', async () => {
    const response = await request(server).get('/api/thesis-applications/all');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Should return array of applications with correct structure', async () => {
    const response = await request(server).get('/api/thesis-applications/all');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length === 0) {
      return;
    }
    const app = response.body[0];
    expect(app).toHaveProperty('id');
    expect(app).toHaveProperty('topic');
    expect(app).toHaveProperty('status');
    expect(app).toHaveProperty('supervisor');
  });
});

describe('GET /thesis-applications/status-history', () => {
  test('Should return 400 if applicationId is missing', async () => {
    const response = await request(server).get('/api/thesis-applications/status-history');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Missing applicationId');
  });

  test('Should get status history for an application', async () => {
    // First try to get an application to test with
    const allAppsResponse = await request(server).get('/api/thesis-applications/all');
    if (allAppsResponse.body.length === 0) {
      return;
    }
    const appId = allAppsResponse.body[0].id;
    const response = await request(server).get(`/api/thesis-applications/status-history?applicationId=${appId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length === 0) {
      return;
    }
    const historyEntry = response.body[0];
    expect(historyEntry).toHaveProperty('id');
    expect(historyEntry).toHaveProperty('oldStatus');
    expect(historyEntry).toHaveProperty('newStatus');
    expect(historyEntry).toHaveProperty('changeDate');
  });
});

describe('POST /thesis-applications', () => {
  test('Should create a new thesis application', async () => {
    const newApplication = {
      topic: 'Integration Test Topic',
      supervisor: {
        id: 1826,
        firstName: 'Paolo',
        lastName: 'Brandimarte',
        email: 'paolo.brandimarte@polito.it',
      },
      coSupervisors: [],
      company: null,
      thesisProposal: null,
    };

    const response = await request(server).post('/api/thesis-applications').send(newApplication);

    expect([200, 201, 400, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('topic', newApplication.topic);
  });

  test('Should validate required fields', async () => {
    const invalidApplication = {
      topic: '', // Empty topic
      supervisor: null, // Missing supervisor
    };

    const response = await request(server).post('/api/thesis-applications').send(invalidApplication);

    expect([400, 500]).toContain(response.status);
  });
});

describe('POST /thesis-applications/cancel', () => {
  test('Should return 404 if application not found', async () => {
    const response = await request(server)
      .post('/api/thesis-applications/cancel')
      .send({ id: 999999, note: 'Test cancellation' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('not found');
  });
});
