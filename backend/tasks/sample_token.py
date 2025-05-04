
# uv task で実行するために myhonme_tools 　を認識させる処理
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parent.parent))

# =========================================================
from myhome_tools.api.utils.token import create_jwt_token

SUB = "test_user"
EMAIL = "user@example.com"
SECRET = "user_secret_key"

def main():
    token = create_jwt_token(
        sub=SUB,
        email=EMAIL,
        secret=SECRET
    )
    print(token)

if __name__ == "__main__":
    main()
