# Notification System Design

## Stage 1

This stage establishes the backend foundation for fetching, prioritizing, and logging notifications.

### 1. Priority Scoring Algorithm

The system ranks notifications based on a composite score of historical importance (weight) and temporal relevance (recency decay). 

- **Weight Allocation**: Different notification types are assigned specific scalar weights indicating business priority:
  - `Placement` = 3
  - `Result` = 2
  - `Event` = 1
- **Recency Decay**: Temporal relevance decays continuously based on the hours elapsed since the notification was generated:
  - `Recency Score = 1 / (1 + hours_elapsed)`
- **Composite Final Score**: The final score blends the static weight and dynamic recency, favoring recent high-priority notifications but preventing critical historical notifications from being suppressed by newer trivial ones.
  - `Final Score = (Weight * 0.7) + (Recency Score * 0.3)`

### 2. Time Complexity & Data Structures

To efficiently extract the top $N$ notifications (where $N$ is the limit and $M$ is the total dataset size, $N \ll M$), the system uses a **Min-Heap bounded to size $N$** rather than sorting the entire array.

#### Complexity Analysis Table

| Operation | Standard Sorting | Bounded Min-Heap (Size $N$) | Advantage |
| :--- | :--- | :--- | :--- |
| **Space Complexity** | $O(M)$ | $O(N)$ | Highly memory efficient; footprint scales with the requested top $N$, not the dataset $M$. |
| **Initialization** | N/A | $O(N)$ | Quickly establishes the initial heap with the first $N$ elements. |
| **Processing elements**| $O(M \log M)$ | $O(M \log N)$ | Processing each subsequent element against the heap takes at most $O(\log N)$. |

*Note on Heap Selection:* To maintain the Top $N$ elements, a Min-Heap of size $N$ is mathematically optimal. The root of the Min-Heap represents the $N$-th highest score (the smallest of our top group). If a new incoming notification has a score higher than the root, we immediately replace the root and heapify down in $O(\log N)$ time, discarding the lowest scoring element from our top tier.

### 3. Data Flow Architecture

The operational data flow for priority notifications executes sequentially:

1. **Fetch Phase**: The Express service performs an authorized HTTP GET request to retrieve the raw notification payload from the upstream `evaluation-service`.
2. **Score Phase**: The service iterates over the dataset, calculating the composite `_score` for each notification in $O(1)$ time per item.
3. **Heap Processing Phase**: Each scored notification is evaluated against the bounded Min-Heap.
4. **Return Phase**: Once all items are processed, the heap contents are extracted, sorted descending (highest score first) in $O(N \log N)$ time, and returned as the API response.

### 4. Handling Real-time Incoming Notifications

The bounded Min-Heap architecture natively supports real-time streaming (e.g., via WebSockets or push events) without requiring the system to re-sort historical data.

- When a new notification arrives, its score is calculated in $O(1)$ time.
- It is compared to the root of the Min-Heap (the lowest score in the Top $N$) in $O(1)$ time.
- If the new score is strictly greater than the root, it replaces the root, and the heap property is restored via a `bubbleDown` operation in $O(\log N)$ time.
- This guarantees near-instantaneous continuous updates to the "Top $N$" view while maintaining predictable CPU cycles and memory usage.

### 5. Centralized Logging Strategy

A unified, centralized logging strategy is enforced using a custom, strictly-typed middleware (`logging_middleware`).

- **Structured Payload**: All logs are emitted with a uniform schema: `{ stack, level, package, message }`.
- **Validation**: TypeScript typings and runtime validations restrict acceptable values (e.g., `stack` must be `frontend` or `backend`, `level` must be `info`, `warn`, `error`, or `fatal`).
- **Observability**: Logs are asynchronously POSTed to the central sink, preventing synchronous blocking of the main Node.js thread.
- **Traceability**: Crucial state transitions (initiating fetch, scoring complete, HTTP errors) emit logs with context-rich messages, simplifying debugging, system audits, and automated alerting.
