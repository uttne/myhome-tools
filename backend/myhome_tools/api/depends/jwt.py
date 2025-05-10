from fastapi import Request, HTTPException
from jose import jwt  # or use `jwt` from `pyjwt` if preferred

def get_sub_from_verified_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")

    token = auth_header[len("Bearer "):]

    try:
        # 🔓 署名検証をスキップしてペイロードだけ取得
        claims = jwt.get_unverified_claims(token)

        sub = claims.get("sub")
        if not sub:
            raise HTTPException(status_code=400, detail="sub claim not found in token")

        return sub
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode JWT : {e}")
