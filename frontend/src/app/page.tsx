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

  const handleCreateUsers = async () => {
    // ここでSalesforceユーザー作成のロジックを実装します
    console.log("ユーザー作成を実行:", importedData);
    // 実際のAPIコールなどを行う場合は、ここに実装します
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Salesforceユーザー一括作成アプリ
      </h1>
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
