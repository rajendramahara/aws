import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

const BUCKET = process.env.BUCKET_NAME;
const TABLE = process.env.TABLE_NAME;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

export const handler = async (event) => {
  console.log("Received HTTP Method:", event.requestContext.http.method);

  // Handle preflight CORS
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    if (event.requestContext.http.method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const id = uuidv4();
      const fileContent = Buffer.from(body.fileContent, "base64");
      const fileKey = `${id}-${body.fileName}`;

      // Upload to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: fileKey,
          Body: fileContent,
        })
      );

      // Save metadata in DynamoDB
      await dynamo.send(
        new PutItemCommand({
          TableName: TABLE,
          Item: {
            id: { S: id },
            name: { S: body.name },
            fileName: { S: body.fileName },
            s3Key: { S: fileKey },
            uploadedAt: { S: new Date().toISOString() },
          },
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "File uploaded successfully!", id }),
      };
    }

    if (event.requestContext.http.method === "GET") {
      const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
      const items = result.Items || [];

      const mapped = await Promise.all(
        items.map(async (item) => {
          const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: BUCKET,
              Key: item.s3Key.S,
            }),
            { expiresIn: 3600 }
          );

          return {
            id: item.id?.S,
            name: item.name?.S,
            fileName: item.fileName?.S,
            uploadedAt: item.uploadedAt?.S,
            fileUrl: url,
          };
        })
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mapped),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};