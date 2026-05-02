import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { Log, setTokenProvider } from '../logging_middleware/index';
import { getToken } from './src/auth';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

setTokenProvider(getToken);

// GET /api/notifications
app.get('/api/notifications', async (req: Request, res: Response) => {
  const { limit, page, notification_type } = req.query;

  try {
    Log("backend", "info", "handler", `Fetching notifications with params: ${JSON.stringify(req.query)}`);

    const token = await getToken();
    const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
      params: { limit, page, notification_type },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const items = Array.isArray(response.data) ? response.data : (response.data.notifications || response.data.data || response.data);
    res.json(items);
  } catch (error: any) {
    Log("backend", "error", "handler", `Error fetching notifications: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/priority
app.get('/api/notifications/priority', async (req: Request, res: Response) => {
  const n = req.query.n ? parseInt(req.query.n as string, 10) : 10;

  try {
    Log("backend", "info", "handler", `Fetching all notifications for priority ranking, top ${n}`);
    
    const token = await getToken();
    const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const items = Array.isArray(response.data) ? response.data : (response.data.notifications || response.data.data || response.data);
    
    if (!Array.isArray(items)) {
      throw new Error("Invalid data format received from evaluation-service");
    }

    Log("backend", "info", "handler", `Calculating priority for ${items.length} notifications`);

    const scoredNotifications = items.map((notif: any) => {
      let weight = 0;
      const type = (notif.Type || '').toLowerCase();
      
      if (type === 'placement') weight = 3;
      else if (type === 'result') weight = 2;
      else if (type === 'event') weight = 1;

      // Recency score
      const createdAt = new Date(notif.Timestamp || Date.now());
      const hoursSince = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
      const recencyScore = 1 / (1 + hoursSince);

      const finalScore = (weight * 0.7) + (recencyScore * 0.3);

      return {
        ...notif,
        _score: finalScore
      };
    });

    scoredNotifications.sort((a, b) => b._score - a._score);
    const topN = scoredNotifications.slice(0, n);

    Log("backend", "info", "handler", `Successfully calculated priority, returning top ${n}`);
    res.json(topN);

  } catch (error: any) {
    Log("backend", "error", "handler", `Error fetching/prioritizing notifications: ${error.message}`);
    res.status(500).json({ error: 'Failed to process priority notifications' });
  }
});

app.listen(PORT, () => {
  Log("backend", "info", "handler", `Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
