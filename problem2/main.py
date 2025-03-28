from fastapi import FastAPI
import httpx
import time
from collections import defaultdict
from config import ENDPOINTS, AUTH_TOKEN

app = FastAPI()

users_data = {}
posts_data = {}
comments_data = {}

user_posts = defaultdict(int)
post_comments = defaultdict(int)
recent_posts = []

async def get_data(url):
    headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            return response.json()
        except:
            return {}

async def get_users():
    if not users_data:
        data = await get_data(ENDPOINTS["users"])
        users_data.update(data.get("users", {}))
    return users_data

async def get_user_posts(user_id):
    data = await get_data(ENDPOINTS["user_posts"].format(user_id=user_id))
    return data.get("posts", [])

async def get_post_comments(post_id):
    data = await get_data(ENDPOINTS["post_comments"].format(post_id=post_id))
    return data.get("comments", [])

async def refresh_data():
    users = await get_users()
    
    user_posts.clear()
    post_comments.clear()
    recent_posts.clear()
    
    for uid in users:
        posts = await get_user_posts(uid)
        user_posts[uid] = len(posts)
        
        for post in posts:
            recent_posts.append((-time.time(), post))
            if len(recent_posts) > 5:
                recent_posts.pop(0)
    
    for uid in users:
        posts = await get_user_posts(uid)
        for post in posts:
            comments = await get_post_comments(post["id"])
            post_comments[post["id"]] = len(comments)

@app.get("/users")
async def top_users():
    await refresh_data()
    users = await get_users()
    
    top = sorted(
        [(uid, user_posts[uid]) for uid in users],
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    return {
        "top_users": [
            {"id": uid, "name": users[uid], "posts": count}
            for uid, count in top
        ]
    }

@app.get("/posts")
async def get_posts(type: str):
    await refresh_data()
    
    if type == "popular":
        max_comments = max(post_comments.values()) if post_comments else 0
        popular = [pid for pid, count in post_comments.items() if count == max_comments]
        
        result = []
        users = await get_users()
        for uid in users:
            posts = await get_user_posts(uid)
            for post in posts:
                if post["id"] in popular:
                    result.append({
                        "id": post["id"],
                        "user": uid,
                        "content": post["content"],
                        "comments": post_comments[post["id"]]
                    })
        
        return {"popular_posts": result}
    
    elif type == "latest":
        latest = sorted(recent_posts, key=lambda x: x[0])
        return {
            "latest_posts": [
                {
                    "id": post["id"],
                    "user": post["userid"],
                    "content": post["content"]
                }
                for _, post in latest
            ]
        }
    
    return {"message": "Invalid type"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 