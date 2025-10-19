import express from "express";
import multer from "multer"; // for handling file uploads
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ✅ Configure AWS S3 client
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g. "us-east-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * ✅ Upload File with KMS encryption
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const key = `uploads/${Date.now()}-${req.file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,

      // Encryption Options (KMS)
      ServerSideEncryption: "aws:kms",
      SSEKMSKeyId: process.env.AWS_KMS_KEY_ID, // optional, else default AWS-managed key
    });

    await s3.send(command);

    res.json({
      message: "File uploaded successfully with KMS encryption",
      key,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

/**
 * ✅ Generate Pre-signed URL to Download
 */
app.get("/download/:key", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download URL", details: err.message });
  }
});

/**
 * ✅ Delete File
 */
app.delete("/delete/:key", async (req, res) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.key,
    });

    await s3.send(command);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete file", details: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 S3 API running on http://localhost:4000");
});
