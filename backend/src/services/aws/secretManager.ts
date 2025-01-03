// secretManager.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-west-2",
  // もしクロスリージョンで取得したい場合はここでregionを指定
});

/**
 * AWS Secrets Manager から Salesforce の認証情報を取得し、
 * JSONオブジェクトにして返す
 */
export async function getSalesforceSecrets(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error("SecretString is empty or undefined");
  }

  // 例: { "SF_USERNAME": "...", "SF_PASSWORD": "...", ... } というJSONをパース
  const secrets = JSON.parse(response.SecretString);

  return {
    SF_USERNAME: secrets.sf_username,
    SF_PASSWORD: secrets.sf_password,
    SF_SECURITY_TOKEN: secrets.sf_security,
    SF_LOGIN_URL: secrets.sf_login_url,
  };
}
