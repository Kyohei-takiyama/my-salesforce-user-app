import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-west-2" });
const bucketName = process.env.S3_BUCKET_NAME || "dev-create-sf-app-bucket";

export async function uploadCsvToS3(csvBuffer: Buffer): Promise<string> {
  // ファイル名をユニークに (例: タイムスタンプ + ランダム)
  const fileName = `csv-uploads/${Date.now()}-${Math.floor(Math.random() * 10000)}.csv`;

  const putParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: csvBuffer,
    ContentType: "text/csv",
  };

  await s3.send(new PutObjectCommand(putParams));

  // アクセスURL (Presigned URL などで返すのもよい)
  return `s3://${bucketName}/${fileName}`;
}
