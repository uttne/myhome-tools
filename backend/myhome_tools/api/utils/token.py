from jose import jwt
import time

def create_jwt_token(sub: str, email: str, secret: str) -> str:
    """
    JWTトークンを生成する関数

    :param sub: ユーザーの識別子
    :param email: ユーザーのメールアドレス
    :param secret: JWTの署名に使用する秘密鍵
    :return: 生成されたJWTトークン
    """
    claims = {
        "sub": sub,
        "email": email,
        "exp": int(time.time()) + 3600,  # トークンの有効期限（1時間後）
    }

    token = jwt.encode(claims, secret, algorithm="HS256")
    return token
