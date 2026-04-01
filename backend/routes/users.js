import express from 'express';
import { saveUser, getUserByEmail, updateUser, deleteUser } from '../services/userService.js';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const router = express.Router();

const TABLE = process.env.DYNAMODB_USERS_TABLE || 'EduLearnUsers';
let docClient = null;
function getDocClient() {
  if (!docClient) {
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(), secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() },
    });
    docClient = DynamoDBDocumentClient.from(raw);
  }
  return docClient;
}

/** GET /api/users/search/:id — find student by numeric ID */
router.get('/search/:id', async (req, res) => {
  try {
    const id = req.params.id
    // Try both Number and String versions of the id (DynamoDB stores what was sent)
    let user = null

    for (const idVal of [Number(id), String(id)]) {
      const result = await getDocClient().send(new ScanCommand({
        TableName: TABLE,
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': idVal },
      }))
      const found = result.Items?.find(u => u.userType === 'student')
      if (found) { user = found; break }
    }

    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, user })
  } catch (err) {
    console.error('Search by ID error:', err)
    res.status(500).json({ error: err.message })
  }
});

/** GET /api/users/:email */
router.get('/:email', async (req, res) => {
  try {
    const user = await getUserByEmail(decodeURIComponent(req.params.email));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('GET user error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/users — create or update user */
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const user = await saveUser(req.body);
    res.json({ success: true, user });
  } catch (err) {
    console.error('POST user error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/users/session — record active session, kick out old device */
router.post('/session', async (req, res) => {
  try {
    const { email, deviceId } = req.body;
    if (!email || !deviceId) return res.status(400).json({ error: 'email and deviceId required' });
    await updateUser(email, { activeDeviceId: deviceId, lastLoginAt: new Date().toISOString() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/users/session/:email/:deviceId — check if this device is still the active one */
router.get('/session/:email/:deviceId', async (req, res) => {
  try {
    const user = await getUserByEmail(decodeURIComponent(req.params.email));
    if (!user) return res.json({ valid: false });
    const valid = !user.activeDeviceId || user.activeDeviceId === req.params.deviceId;
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/users/:email — partial update */
router.patch('/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const updated = await updateUser(email, req.body);
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('PATCH user error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/users/:email */
router.delete('/:email', async (req, res) => {
  try {
    await deleteUser(decodeURIComponent(req.params.email));
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE user error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
