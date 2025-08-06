import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private upload: any;

  constructor() {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'asnaf-documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure multer storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      },
    });

    // Configure multer
    this.upload = multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5, // Maximum 5 files
      },
      fileFilter: (req, file, cb) => {
        // Allow specific file types
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable((observer) => {
      this.upload.array('documents', 5)(request, response, (err: any) => {
        if (err) {
          observer.error(err);
          return;
        }

        // Add file information to request body
        if (request.files && request.files.length > 0) {
          request.body.documents = request.files.map((file: any) => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
          }));
        }

        next.handle().subscribe({
          next: (data) => observer.next(data),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
} 