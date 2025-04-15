import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env.cognito" });

import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  MessageActionType,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// YAML ファイルのパス（必要に応じてパスを調整してください）
const YAML_FILE_PATH = path.join(__dirname, "users.yaml");

// YAML 内のユーザーデータの型定義
interface TestUser {
  username: string;
  email: string;
  temporaryPassword: string;
}

interface UsersYaml {
  users: TestUser[];
}

// YAML ファイルからユーザー情報を読み込む関数
async function loadUsersFromYaml(): Promise<TestUser[]> {
  try {
    const fileContents = fs.readFileSync(YAML_FILE_PATH, "utf8");
    const data = yaml.load(fileContents) as UsersYaml;
    if (!data.users || !Array.isArray(data.users)) {
      throw new Error(
        "YAMLの形式が正しくありません。'users' 配列を確認してください。"
      );
    }
    return data.users;
  } catch (error) {
    throw new Error(`YAML ファイルの読み込みエラー: ${error}`);
  }
}

// ユーザーがすでに存在するか確認する関数
async function userExists(
  client: CognitoIdentityProviderClient,
  userPoolId: string,
  username: string
): Promise<boolean> {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    });
    await client.send(command);
    // ユーザーが存在する場合は true を返す
    return true;
  } catch (error: any) {
    // ユーザーが存在しない場合、UserNotFoundException や ResourceNotFoundException が発生するはず
    if (
      error.name === "UserNotFoundException" ||
      error.name === "ResourceNotFoundException"
    ) {
      return false;
    }
    // その他のエラーは再スローする
    throw error;
  }
}

// Cognito に対してユーザーを削除する関数
async function deleteUser(
  client: CognitoIdentityProviderClient,
  user: TestUser,
  userPoolId: string
) {
  const params = {
    UserPoolId: userPoolId,
    Username: user.email,
  };

  try {
    const command = new AdminDeleteUserCommand(params);
    const response = await client.send(command);
    console.log(`ユーザー [${user.username}] を削除しました。`, response);
  } catch (error) {
    console.error(
      `ユーザー [${user.username}] の削除中にエラーが発生しました:`,
      error
    );
  }
}

// メイン関数
async function main() {
  // .env から必要な情報を取得
  const userPoolId = process.env.VITE_cognito_user_pool_id;
  const region = process.env.VITE_cognito_region || "us-east-1";

  if (!userPoolId) {
    console.error(
      "エラー: .env に cognito_user_pool_id が定義されていません。"
    );
    process.exit(1);
  }

  // AWS Cognito クライアントの初期化
  const client = new CognitoIdentityProviderClient({ region });

  // YAML ファイルからユーザーリストを読み込み
  const users = await loadUsersFromYaml();

  // 各ユーザーを登録
  for (const user of users) {
    // 重複の確認（email を Username としてチェック）
    const exists = await userExists(client, userPoolId, user.email);
    if (!exists) {
      console.log(
        `ユーザー [${user.email}] は存在していません。スキップします。`
      );
      continue;
    }
    await deleteUser(client, user, userPoolId);
  }
}

main().catch((error) => {
  console.error("処理中にエラーが発生しました:", error);
  process.exit(1);
});
