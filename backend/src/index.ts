// handler.ts
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
// import { verifyCognitoToken } from "./auth";
import { parseCsv } from "./services/csvService";
// import { uploadCsvToS3 } from "./s3Service";
import { createSalesforceUsers } from "./services/salesforceService";

/**
 * Lambdaのメインハンドラー (API Gateway の Proxy 経由を想定)
 */
export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // CORS ヘッダー設定 (必要に応じて調整)
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  try {
    const csvData = `Name,Email
    Taro,taro@example.com
    Hanako,hanako@example.com`;
    const csvBase64 = Buffer.from(csvData).toString("base64");
    // OPTIONSメソッドへの対応
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({ message: "OK" }),
      };
    }

    // 認証 (Cognito トークン検証)
    // const token = event.headers?.Authorization || "";
    // if (!token) {
    //   return {
    //     statusCode: 401,
    //     headers: defaultHeaders,
    //     body: JSON.stringify({ error: "No authorization token found" }),
    //   };
    // }

    // // トークン検証 (失敗すれば例外スロー)
    // await verifyCognitoToken(token);

    // Body のパラメータなどを取り出す (CSVデータ想定)
    // フロントから Base64 エンコード済みCSVデータを受け取る想定例
    const body = event.body ? JSON.parse(event.body) : {};
    // const csvBase64 = body.csvBase64;
    if (!csvBase64) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: "csvBase64 is required" }),
      };
    }

    // 1. CSV パース
    const csvBuffer = Buffer.from(csvBase64, "base64");
    const records = await parseCsv(csvBuffer);
    console.log(JSON.stringify(records, null, 2));
    // records は { [columnName: string]: string }[] の配列

    // 2. S3 アップロード (生CSVをそのまま or 必要に応じてファイル名生成など)
    // const s3Url = await uploadCsvToS3(csvBuffer);

    // 3. Salesforce ユーザー作成
    //    CSVの各行にユーザー情報(名前・メール・プロファイルID等)が含まれる前提
    // const sfResult = await createSalesforceUsers(records);

    // レスポンス
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Success",
        // s3Url,
        // salesforceResult: sfResult,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        detail: `${error}`,
      }),
    };
  }
};
