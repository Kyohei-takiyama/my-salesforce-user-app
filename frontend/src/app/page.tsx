"use client";

import { useState } from "react";
import CSVImporter from "./components/cSVImporter";
import DataTable from "./components/dataTable";
import CreateUsersButton from "./components/createUsersButton";

export default function Home() {
  const [importedData, setImportedData] = useState<any[]>([]);

  const handleDataImported = (data: any[]) => {
    setImportedData(data);
  };

  // Salesforceユーザー作成ボタン押下時に呼ばれる
  const handleCreateUsers = async () => {
    try {
      console.log("ユーザー作成を実行:", importedData);

      // API Gateway経由でLambda(/create)を呼び出し
      const response = await fetch(
        "https://7kry00mylg.execute-api.us-west-2.amazonaws.com/dev/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // { users: [...] } の形式でバックエンドに送る
          body: JSON.stringify({
            users: importedData,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Salesforce creation error:", data);
        return;
      }
      console.log("Salesforce creation success:", data);
      alert("Salesforceユーザーの作成が完了しました");
    } catch (error) {
      console.error("Error creating users:", error);
      alert("Salesforceユーザーの作成に失敗しました");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Salesforceユーザー一括作成アプリ
      </h1>
      <p className="mb-4">インポートされたデータ件数: {importedData.length}</p>
      <CSVImporter onDataImported={handleDataImported} />
      {importedData.length > 0 && (
        <>
          <DataTable data={importedData} />
          <CreateUsersButton
            onCreateUsers={handleCreateUsers}
            disabled={importedData.length === 0}
          />
        </>
      )}
    </div>
  );
}
