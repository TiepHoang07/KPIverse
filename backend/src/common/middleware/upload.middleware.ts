import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = '/uploads'
      if (!existsSync(uploadPath)) mkdirSync(uploadPath)
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
    }
  }),
  limits: {fileSize: 2 * 1024 * 1024},
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(new Error('Unsupported file type'), false)
    } else {
      cb(null, true)
    }
  }
}