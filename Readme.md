 AWS S3 File Upload API with KMS Encryption

This project is a simple Node.js + Express API for securely uploading, downloading, and deleting files in Amazon S3 with KMS (Key Management Service) encryption enabled.

It uses:
Express for API routing
Multer for file uploads
AWS SDK v3 for S3 operations
AWS KMS for server-side encryption

Features:

1) Upload files to S3 with KMS encryption
2) Generate pre-signed URLs for secure downloads
3) Delete files from S3
4) Memory storage via multer (no local file persistence)
5) Configurable via environment variables


Environment Variables:
Create a .env file in the project root and configure the following:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-s3-bucket
AWS_KMS_KEY_ID=your-kms-key-id   # optional, AWS default key is used if not provided



📂 API Endpoints
1. Upload File (KMS Encryption)
POST /upload

Form-data:
file: (required) The file to upload
Example:
 -X POST http://localhost:4000/upload\
  -F "file=@./example.png"
Response:
{
  "message": "File uploaded successfully with KMS encryption",
  "key": "uploads/1697728492345-example.png"
}

2. Generate Pre-Signed Download URL
GET /download/:key
Example:http://localhost:4000/download/uploads/1697728492345-example.png

Response:
{
  "url": "https://bucket-name.s3.amazonaws.com/uploads/1697728492345-example.png?X-Amz-SignedHeaders=..."
}


3. Delete File
DELETE /delete/:key
Example:-X DELETE http://localhost:4000/delete/uploads/1697728492345-example.png

Response:
{
  "message": "File deleted successfully"
}

Security Notes
Uses AWS KMS for encryption:
aws:kms ensures server-side encryption of uploaded files.
Custom KMS key (AWS_KMS_KEY_ID) is optional.
Presigned URLs expire in 1 hour for secure access.
Store secrets in .env, never hardcode credentials.

Future Improvements
Add support for multi-file uploads
Add pagination & listing files from S3
Add role-based access (IAM policies, JWT integration)
