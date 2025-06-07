from uuid import uuid4


def create_id() -> str:
    """
    ユニークなIDを生成する関数
    UUIDを使用して、ユニークなIDを生成します。
    """
    return str(uuid4())
