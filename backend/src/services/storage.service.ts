import fs from 'fs';
import path from 'path';

export interface StorageService {
  saveFile(file: Express.Multer.File): Promise<string>;
}

export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/${filename}`;
  }
}

export const storageService = new LocalStorageService();
