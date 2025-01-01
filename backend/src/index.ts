import { APIGatewayEvent, Context } from "aws-lambda";
import { handler as func } from "./services/salesforce/salesforceApiClient";

export const handler = async (event: APIGatewayEvent, context: Context) => {
  try {
    // ここで別の処理やルーティングを行うことも
    const result = func();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error in Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error }),
    };
  }
};
