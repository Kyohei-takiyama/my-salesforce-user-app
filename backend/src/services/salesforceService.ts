// salesforceService.ts
import * as jsforce from "jsforce";

import { getSalesforceSecrets } from "./aws/secretManager";

interface SalesforceUserRecord {
  FirstName?: string;
  LastName: string;
  Email: string;
  Username?: string;
  Alias?: string;
  TimeZoneSidKey?: string;
  LocaleSidKey?: string;
  EmailEncodingKey?: string;
  LanguageLocaleKey?: string;
  ProfileId?: string;
  UserRoleId?: string;
  // 必要に応じて他フィールドも追加
}

/**
 * レコード(配列)からユーザーを作成する一例
 */
export async function createSalesforceUsers(
  userRecords: SalesforceUserRecord[]
) {
  // Salesforce の認証情報を取得
  const { SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN, SF_LOGIN_URL } =
    await getSalesforceSecrets("dev-create-sf-app-seacret");

  // Salesforce ログイン
  const conn = new jsforce.Connection({ loginUrl: SF_LOGIN_URL });
  await conn.login(SF_USERNAME, `${SF_PASSWORD}${SF_SECURITY_TOKEN}`);

  // 例: まとめて User オブジェクトを insert
  // カスタムオブジェクトの場合は sobject('CustomObject__c') などを使う
  const results = [];
  for (const user of userRecords) {
    try {
      // 参考: https://jsforce.github.io/document/#create
      const res = await conn.sobject("User").create({
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        // ユーザー名やエイリアス, profileId などユーザー作成に必須のフィールドを適切に設定
        Username: user.Email, // 一例としてEmailをUsernameに設定
        Alias: user.Alias || user.LastName,
        TimeZoneSidKey: user.TimeZoneSidKey || "Asia/Tokyo",
        LocaleSidKey: user.LocaleSidKey || "ja",
        EmailEncodingKey: user.EmailEncodingKey || "ISO-2022-JP",
        LanguageLocaleKey: user.LanguageLocaleKey || "ja",
        ProfileId: user.ProfileId,
        UserRoleId: user.UserRoleId,
      });
      results.push(res);
      console.log("Salesforce create user success: ", JSON.stringify(res));
    } catch (e) {
      console.error("Salesforce create user error: ", e);
      results.push({ success: false, error: e });
    }
  }

  return results;
}
