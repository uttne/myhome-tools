#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import ignore from "ignore";
import { parse } from "ts-command-line-args";
import clipboardy from "clipboardy"; // ★ 追加

/* ───── 1. CLI ───── */
interface IArgs {
  repoPath: string; // 既定 "."
  output?: string; // 既定 "llm_input.txt"
  copy?: boolean; // --copy / -c でクリップボードへ
  help?: boolean;
}

const args = parse<IArgs>(
  {
    repoPath: { type: String, defaultValue: "." },
    output: { type: String, optional: true },
    copy: { type: Boolean, alias: "c", optional: true }, // ★
    help: { type: Boolean, alias: "h", optional: true },
  },
  {
    helpArg: "help",
    headerContentSections: [
      {
        header: "collect",
        content:
          "Collect text files under <repoPath>, respecting .gitignore / .llmignore in every folder.\n" +
          "Binary files are noted with a placeholder. Use --copy to send the result to your clipboard.",
      },
    ],
  }
);

/* ───── 2. パス解決 ───── */
const ROOT = path.resolve(args.repoPath);
const OUTPUT = args.output
  ? path.resolve(process.cwd(), args.output)
  : "llm_input.txt";

/* ───── 3. ignore パターン ───── */
const ig = ignore();

function addIgnoreFile(filePath: string, dirRel: string): void {
  if (!fs.existsSync(filePath)) return;

  const patterns = fs
    .readFileSync(filePath, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line) => {
      const neg = line.startsWith("!");
      let pat = neg ? line.slice(1) : line;

      const prefixed = (() => {
        if (dirRel) {
          if (pat.startsWith("/")) pat = pat.slice(1); // ルート基準 → 削除
          return path.posix.join(dirRel.replace(/\\/g, "/"), pat);
        } else {
          return pat;
        }
      })();
      return (neg ? "!" : "") + prefixed;
    });
  ig.add(patterns);
}

function isText(fp: string): boolean {
  try {
    const buf = fs.readFileSync(fp);
    return !buf.subarray(0, Math.min(buf.length, 8000)).includes(0); // NUL byte 判定
  } catch {
    return false;
  }
}

/* ───── 4. 再帰 walk(root, rel) ───── */
function walk(root: string, rel: string): void {
  const full = rel ? path.join(root, rel) : root;

  if (fs.statSync(full).isDirectory()) {
    // ディレクトリ固有 ignore を追加
    addIgnoreFile(path.join(full, ".gitignore"), rel);
    addIgnoreFile(path.join(full, ".llmignore"), rel);

    // ディレクトリ自体が無視対象なら降りない
    if (rel && ig.ignores(rel)) return;

    for (const name of fs.readdirSync(full)) {
      walk(root, path.join(rel, name)); // root は固定
    }
  } else if (!ig.ignores(rel)) {
    if (isText(full)) {
      out.write(`==== FILE: ${rel} ====\n`);
      out.write(fs.readFileSync(full, "utf-8"));
    } else {
      out.write(`==== BINARY FILE: ${rel} ====\n`);
      out.write("<BINARY CONTENT OMITTED>");
    }
    out.write("\n\n");
  }
}

/* ───── 5. 実行 ───── */
addIgnoreFile(path.join(ROOT, ".gitignore"), "");
addIgnoreFile(path.join(ROOT, ".llmignore"), "");

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true }); // 出力フォルダを自動生成

const out = fs.createWriteStream(OUTPUT, "utf-8");
walk(ROOT, ""); // ルートから開始
out.end(() => {
  console.log(`✅  Saved to ${OUTPUT}`);
  if (args.copy) {
    try {
      const content = fs.readFileSync(OUTPUT, "utf-8");
      clipboardy.writeSync(content); // ★ クリップボードへ
      console.log("📋  Copied output to clipboard.");
    } catch (err: any) {
      console.error(`⚠️  Failed to copy to clipboard: ${err.message}`);
    }
  }
});
