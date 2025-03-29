import fs from "fs";
import path from "path";
import ignore from "ignore";

const REPO_PATH = path.resolve(".");
const TARGET_FILE = path.join(REPO_PATH, ".llmtarget");
const OUTPUT_FILE = "llm_input.txt";

/**
 * .gitignore のルールをロード
 */
function loadGitignorePatterns(repoPath: string): ignore.Ignore {
    const gitignorePath = path.join(repoPath, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
        return ignore();
    }
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    return ignore().add(gitignoreContent);
}

/**
 * 指定した .llmtarget ファイルから対象のファイル・フォルダを読み込む
 */
function loadLlmtarget(targetFile: string): string[] {
    if (!fs.existsSync(targetFile)) {
        console.error(`Error: ${targetFile} not found.`);
        process.exit(1);
    }

    const targetContent = fs.readFileSync(targetFile, "utf-8");
    return targetContent
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith("#")); // 空行とコメントを除外
}

/**
 * 指定されたファイルがテキストファイルかどうかを判定
 */
function isTextFile(filePath: string): boolean {
    try {
        const buffer = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
        return /^[\x20-\x7E\t\r\n]*$/.test(buffer.substring(0, 1024)); // 最初の1KBを判定
    } catch (error) {
      console.error(`Error: ${filePath} cannot be read. ${error.message}`);
        return false; // バイナリファイルや読み取り不可ファイル
    }
}

/**
 * 指定されたファイル・フォルダを再帰的に処理し、テキストを収集
 */
function collectFilesContent(repoPath: string, targetFile: string, outputFile: string): void {
    const gitignore = loadGitignorePatterns(repoPath);
    const targetPaths = loadLlmtarget(targetFile);

    const outputStream = fs.createWriteStream(outputFile, { encoding: "utf-8" });

    function processFileOrDirectory(fileOrDir: string): void {
        const fullPath = path.join(repoPath, fileOrDir);

        if (!fs.existsSync(fullPath)) {
            console.warn(`Warning: ${fileOrDir} does not exist.`);
            return;
        }

        if (gitignore.ignores(fileOrDir)) {
            console.warn(`Skipping ignored file/folder: ${fileOrDir}`);
            return;
        }

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const files = fs.readdirSync(fullPath);
            files.forEach(file => processFileOrDirectory(path.join(fileOrDir, file)));
        } else if (stat.isFile() && isTextFile(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, "utf-8");
                outputStream.write(`==== FILE: ${fileOrDir} ====\n`);
                outputStream.write(content);
                outputStream.write("\n\n");
            } catch (error) {
                console.warn(`Warning: Failed to read ${fileOrDir}: ${error.message}`);
            }
        }
    }

    targetPaths.forEach(target => processFileOrDirectory(target));

    outputStream.end();
    console.log(`Collected file contents are saved in ${outputFile}`);
}

// 実行
collectFilesContent(REPO_PATH, TARGET_FILE, OUTPUT_FILE);
