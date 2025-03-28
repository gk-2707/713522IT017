# Social Media Analytics HTTP Microservice

This microservice provides real-time analytics for social media data, including top users and posts analysis.

## Features

- Get top 5 users with the highest number of posts
- Get popular posts (posts with maximum comments)
- Get latest 5 posts in real-time
- Efficient caching and data structures for optimal performance
- Async operations for better throughput

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python main.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### Get Top Users
```
GET /users
```
Returns the top 5 users with the highest number of posts.

### Get Posts
```
GET /posts?type={type}
```
Query Parameters:
- `type`: Either "popular" or "latest"
  - "popular": Returns posts with the maximum number of comments
  - "latest": Returns the 5 most recent posts

## Technical Details

- Built with FastAPI for high performance
- Uses async/await for efficient I/O operations
- Implements caching to minimize API calls
- Uses efficient data structures (heapq, defaultdict) for optimal performance
- Handles dynamic data updates from the social media platform

## Performance Considerations

- Implements caching with a 60-second TTL to balance freshness and performance
- Uses heap data structure for maintaining latest posts
- Efficiently tracks post and comment counts using defaultdict
- Minimizes API calls while ensuring data accuracy 