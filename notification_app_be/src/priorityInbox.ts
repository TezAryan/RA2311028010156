import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { Log, setTokenProvider } from '../../logging_middleware';
import { getToken } from './auth';

// Load .env from the root of notification_app_be
dotenv.config({ path: path.resolve(__dirname, '../.env') });

setTokenProvider(getToken);

interface Notification {
  [key: string]: any;
}

interface ScoredNotification extends Notification {
  _score: number;
}

/**
 * MinHeap implementation to maintain the Top N notifications efficiently.
 *
 * Why use a Min-Heap of size K instead of Sorting?
 * - Sorting the entire array of N items takes O(N log N) time complexity.
 * - A Min-Heap of size K (where K is the number of top items we want to keep, e.g., 10)
 *   takes O(K) to initialize and O(N log K) to process all N items.
 * - As we iterate through each item, if it has a higher score than the smallest item
 *   in our size-K heap (the root), we replace the root and heapify down. This guarantees
 *   that the heap ultimately contains the top K largest elements.
 * - Since K (e.g., 10) is typically much smaller than N (total notifications),
 *   O(N log K) is significantly more efficient and scales far better than O(N log N).
 */
class MinHeap {
  private heap: ScoredNotification[] = [];

  constructor(private maxSize: number) {}

  public insert(item: ScoredNotification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
    } else if (item._score > this.heap[0]._score) {
      this.heap[0] = item;
      this.bubbleDown(0);
    }
  }

  public getItems(): ScoredNotification[] {
    // Return items sorted descending (highest score first)
    return [...this.heap].sort((a, b) => b._score - a._score);
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex]._score <= this.heap[index]._score) break;
      
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild]._score < this.heap[smallest]._score) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild]._score < this.heap[smallest]._score) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

async function run() {
  const n = 10;
  
  try {
    await Log("backend", "info", "utils", `Starting priority inbox fetch process for top ${n}`);
    
    const token = await getToken();
    if (!token) {
      throw new Error("Unable to fetch valid authentication token.");
    }

    const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const items = Array.isArray(response.data) ? response.data : (response.data.notifications || response.data.data || response.data);
    
    if (!Array.isArray(items)) {
      throw new Error("Invalid data format received from evaluation-service");
    }

    await Log("backend", "info", "utils", `Successfully fetched ${items.length} notifications. Processing with MinHeap.`);

    const minHeap = new MinHeap(n);

    items.forEach((notif: any) => {
      let weight = 0;
      const type = (notif.Type || '').toLowerCase();
      
      if (type === 'placement') weight = 3;
      else if (type === 'result') weight = 2;
      else if (type === 'event') weight = 1;

      const createdAtStr = notif.Timestamp;
      const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
      
      // Calculate hours elapsed
      const hoursSince = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
      const recencyScore = 1 / (1 + hoursSince);

      const finalScore = (weight * 0.7) + (recencyScore * 0.3);

      minHeap.insert({
        ...notif,
        _score: finalScore
      });
    });

    const topNotifications = minHeap.getItems();
    
    await Log("backend", "info", "utils", `Completed priority scoring. Printing top ${n} to console.`);

    // Formatting for console table
    const tableData = topNotifications.map((notif, index) => ({
      Rank: index + 1,
      Type: notif.Type || 'N/A',
      Message: notif.Message || 'N/A',
      Timestamp: notif.Timestamp || 'N/A',
      Score: notif._score.toFixed(4)
    }));

    console.table(tableData);

  } catch (error: any) {
    await Log("backend", "error", "utils", `Error in priorityInbox process: ${error.message}`);
    console.error("Process failed:", error.message);
  }
}

run();
