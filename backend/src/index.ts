// handler.ts
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { parseCsv } from "./services/csvService";
import { createSalesforceUsers } from "./services/salesforceService";
import { uploadCsvToS3 } from "./services/aws/s3Service";

/**
 * CSVをインポートしてパース結果を返す
 */
async function importHandler(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // 1. リクエストボディからcsvBase64を取り出す
    const body = event.body ? JSON.parse(event.body) : {};
    let csvBase64 = body.csvBase64;
    if (!csvBase64) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: "csvBase64 is required" }),
      };
    }

    // 2. CSV パース
    const csvBuffer = Buffer.from(csvBase64, "base64");
    const records = await parseCsv(csvBuffer);
    const s3Url = await uploadCsvToS3(csvBuffer);

    // 3. パースした結果（行ごとのオブジェクト配列）を返す
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Import success",
        records, // フロントに返してテーブル表示などに使う
        s3Url, // S3にアップロードした場所
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: "Import error", detail: `${error}` }),
    };
  }
}

/**
 * Salesforce ユーザーを作成する
 */
async function createHandler(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // 1. リクエストボディに "users" フィールドを期待する (例)
    //   フロント側で「インポート済みデータをテーブルに表示 → JSON化して送る」イメージ
    const body = event.body ? JSON.parse(event.body) : {};
    const users = body.users;
    if (!Array.isArray(users) || users.length === 0) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: "users array is required" }),
      };
    }

    // 2. Salesforceユーザー作成
    //    createSalesforceUsers の引数は
    //    [{ Name: 'Taro', Email: 'taro@example.com' }, ...] のような配列を想定
    const result = await createSalesforceUsers(users);

    if (result.filter((r: any) => r.success === false).length > 0) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({
          error: "Salesforce creation error",
          detail: result,
        }),
      };
    }

    // 3. 作成結果を返す
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Salesforce creation success",
        result,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: "Salesforce creation error",
        detail: `${error}`,
      }),
    };
  }
}

/**
 * メインの Lambda ハンドラー (ルーター)
 * API Gatewayで /import や /create を設定した上で、path等で分岐
 */
export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // CORS 等の共通設定 (OPTIONSメソッド用)
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ message: "OK" }),
    };
  }

  console.log(`Event***********: ${JSON.stringify(event, null, 2)}`);

  // 例: API Gateway 側で「/import」「/create」をリソースに設定し、同じLambdaを紐づけた場合
  switch (event.path) {
    case "/import":
      return importHandler(event);
    case "/create":
      return createHandler(event);
    default:
      return {
        statusCode: 404,
        headers: defaultHeaders,
        body: JSON.stringify({ error: "Not found" }),
      };
  }
};
