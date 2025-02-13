from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/api/")
async def get_root():
    return {"msg": "Hello World"}

handler = Mangum(app)
