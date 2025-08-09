import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";
import z from "zod/v4";
import { env } from "./env";

export const uploadFileToStorageInput = z.object({
  folder: z.enum(['images', 'downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

export type UploadFileToStorageInput = z.infer<typeof uploadFileToStorageInput>

export class S3Service {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
      },
    })
  }

  /**
   * Faz upload de um arquivo para o storage R2/S3
   */
  async uploadFile(input: UploadFileToStorageInput) {
    const { folder, fileName, contentType, contentStream } = input;

    const key = `${folder}/${fileName}`;

    const sanitizedKey = this.sanitizedUrl(key);

    const exists = await this.fileExists(sanitizedKey);
    if (exists) {
      throw new Error(`Arquivo já existe: ${key}`);
    }

    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: env.CLOUDFLARE_BUCKET,
          Key: sanitizedKey,
          Body: contentStream,
          ContentType: contentType,
        },
      });

      await upload.done();

      return {
        url: new URL(this.getPublicUrl(sanitizedKey)).toString(),
        key: sanitizedKey,
      }
    } catch (error) {
      throw new Error(`Erro ao fazer upload do arquivo: ${error}`);
    }
  }

  /**
   * Gera uma URL pública para um arquivo no storage
   */
  private getPublicUrl(key: string): string {
    return `${env.CLOUDFLARE_PUBLIC_URL}/${key}`;
  }

  /**
   * Remove parâmetros desnecessários de uma URL e sanitiza
   */
  private sanitizedUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // Remove parâmetros de query que podem ser desnecessários
      const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

      return cleanUrl;
    } catch (error) {
      // Se a URL for inválida, retorna a string original
      return url;
    }
  }

  /**
   * Verifica se um arquivo existe no storage
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new GetObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gera um nome de arquivo único baseado no timestamp e extensão
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || '';
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');

    return `${nameWithoutExtension}-${timestamp}.${extension}`;
  }
}