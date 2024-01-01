import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import NotFoundError from "../common/error/NotFoundError";

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: "ap-northeast-2",
});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    acl: "public-read",
    key(req, file, cb) {
      cb(null, `profile_imgs/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${file.originalname}`);
    },
  }),
});
