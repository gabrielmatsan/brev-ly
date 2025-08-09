import { stringify } from 'csv-stringify';
import { PassThrough, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { z } from 'zod/v4';
import { db, pg } from "../../shared/database/db";
import { makeRight, type Either } from '../../shared/either';
import { S3Service } from '../../shared/s3.service';
import { linkSchema } from "../domain/link.schema";


export const exportUploadsOutput = z.object({
  reportUrl: z.string(),
})

export async function exportUrlsToCsv(): Promise<Either<Error, z.infer<typeof exportUploadsOutput>>> {
  const { sql, params } = db
    .select()
    .from(linkSchema)
    .toSQL()


  const cursor = pg.unsafe(sql, params as string[]).cursor(10)

  const csv = stringify({
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'originalUrl', header: 'Original URL' },
      { key: 'shortUrl', header: 'Short URL' },
      { key: 'visits', header: 'Visits' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'updatedAt', header: 'Updated At' },
    ]
  })

  const uploadToStorageStream = new PassThrough()

  /**
   * Convert the cursor to a CSV stream
   */
  const convertToCsvPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }
        callback()
      },
    }),
    csv,
    uploadToStorageStream
  )

  const s3 = new S3Service()


  const uploadToStorage = s3.uploadFile({
    folder: 'downloads',
    contentType: 'text/csv',
    fileName: s3.generateUniqueFileName('links.csv'),
    contentStream: uploadToStorageStream,
  })


  const [{ url }] = await Promise.all([
    uploadToStorage,
    convertToCsvPipeline,
  ])


  await convertToCsvPipeline

  return makeRight({
    reportUrl: url,
  })

}