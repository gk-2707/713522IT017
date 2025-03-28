from typing import Dict

# Base URL for the social media platform API
BASE_URL = "http://20.244.56.144/test"

# Authentication token
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTUwMTU0LCJpYXQiOjE3NDMxNDk4NTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImRjNTI2YTM4LWEyOTQtNGRjMC1iNTViLWVjODY1ZjQxYzgwZiIsInN1YiI6ImdnazcxMDMwNkBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6ImRjNTI2YTM4LWEyOTQtNGRjMC1iNTViLWVjODY1ZjQxYzgwZiIsImNsaWVudFNlY3JldCI6IkxPQURoYm5meVdObEF5V2EiLCJvd25lck5hbWUiOiJSYWh1bCIsIm93bmVyRW1haWwiOiJnZ2s3MTAzMDZAZ21haWwuY29tIiwicm9sbE5vIjoiNzEzNTIyMDE3In0.QUXHdi22hx7Yqe19P7KlrQjermY3kENRxxdOut5nz6I"

# Cache settings (in seconds)
CACHE_TTL = 60  # Cache time to live

# API endpoints
ENDPOINTS = {
    "users": f"{BASE_URL}/users",
    "user_posts": f"{BASE_URL}/users/{{user_id}}/posts",
    "post_comments": f"{BASE_URL}/posts/{{post_id}}/comments"
}

# Response models
class User(Dict):
    id: str
    name: str

class Post(Dict):
    id: int
    userid: int
    content: str

class Comment(Dict):
    id: int
    postid: int
    content: str 