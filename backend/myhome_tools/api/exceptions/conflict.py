

from fastapi import HTTPException


class NotInitializedError(HTTPException):
    """初期化が完了していないリソースにアクセスしようとした場合の例外"""
    
    def __init__(self, detail="Resource has not been initialized."):
        super().__init__(status_code=409, detail=detail)
