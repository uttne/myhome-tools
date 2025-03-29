#!/usr/bin/env python3
import subprocess
import shutil
import sys
from pathlib import Path

def get_repo_root():
    """
    tasks/package_main.py から見たリポジトリルートを取得する。
    このスクリプトは tasks/ 内に配置されている前提。
    """
    script_dir = Path(__file__).resolve().parent
    # tasks/ の1階層上をリポジトリルートとする
    repo_root = script_dir.parent
    return repo_root

def get_git_files(repo_root: Path):
    """
    git ls-files --cached と --others --exclude-standard を -z オプション付きで実行し、
    tracked と untracked なファイルの一覧を返す。
    """
    try:
        # tracked ファイル（すでに Git に追加済み）の一覧
        cached = subprocess.check_output(
            ["git", "ls-files", "--cached", "-z"],
            cwd=str(repo_root)
        )
        # untracked ファイル（Git に追加されていないが .gitignore に含まれていないもの）の一覧
        others = subprocess.check_output(
            ["git", "ls-files", "--others", "--exclude-standard", "-z"],
            cwd=str(repo_root)
        )
        # -z オプションで null 文字区切りになっているので分割してリスト化
        cached_files = cached.decode("utf-8").split("\0")
        others_files = others.decode("utf-8").split("\0")
        # 空文字列を除外して結合
        files = [f for f in (cached_files + others_files) if f]
        return files
    except subprocess.CalledProcessError:
        print("Error: Failed to run git ls-files.", file=sys.stderr)
        sys.exit(1)

def main():
    repo_root = get_repo_root()
    file_list = get_git_files(repo_root)

    # コピー先: <repo_root>/dist/main/python
    dest_dir = repo_root / "dist" / "main" / "python"

    # 既存のコピー先ディレクトリがあれば削除してクリーンな状態にする
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)

    for rel_path in file_list:
        # 出力先の dist/ 以下はコピー対象から除外（無限ループ防止）
        if rel_path.startswith("dist" + "/"):
            continue
        src_file = repo_root / rel_path
        dst_file = dest_dir / rel_path
        dst_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.copy2(src_file, dst_file)
            print(f"Copied: {rel_path}")
        except Exception as e:
            print(f"Failed to copy {rel_path}: {e}", file=sys.stderr)

    print(f"All files copied to: {dest_dir}")

if __name__ == "__main__":
    main()
