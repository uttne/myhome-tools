#!/usr/bin/env python
import os
import shutil

def main():
    # スクリプトの絶対パスから、プロジェクトルート内の dist ディレクトリを参照する
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # tasks/ の1階層上がプロジェクトルートと仮定
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    # 入力ディレクトリ: <project_root>/dist/packages
    source_dir = os.path.join(project_root, "dist", "layer", "packages", "Lib")
    # 一時作業用ディレクトリ: <project_root>/dist/python
    temp_dir = os.path.join(project_root, "dist", "layer", "python", "python", "lib", "python3.13")

    # もし作業用ディレクトリが存在していれば削除
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    # source_dir の内容を temp_dir にコピーする
    # temp_dir は最終的にZIP内で「python/」というフォルダになる
    for item in os.listdir(source_dir):
        s = os.path.join(source_dir, item)
        d = os.path.join(temp_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)

    print(f"All files copied to: {temp_dir}")

if __name__ == "__main__":
    main()
