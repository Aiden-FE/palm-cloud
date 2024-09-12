import { BusinessStatus, HttpResponse } from '@app/common';
import { MinioService } from '@app/minio';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OssService {
  constructor(private readonly minioSvc: MinioService) {}

  async getVideos() {
    const respBody = await new Promise((resolve) => {
      const result = [] as any[];
      this.minioSvc.client
        .listObjectsV2('aiden-private', 'projects/privacy/videos', true)
        .on('data', async (data) => {
          result.push(data);
        })
        .on('end', async () => {
          const promiseTask = result.map(async (item) => {
            const url = await this.minioSvc.client.presignedGetObject('aiden-private', item.name);
            return {
              ...item,
              name: item.name.replace('projects/privacy/videos/', ''),
              url,
            };
          });
          resolve(await Promise.all(promiseTask));
        })
        .on('error', (err) => {
          return new HttpResponse({ statusCode: BusinessStatus.BAD_REQUEST, message: err.message });
        });
    });
    return respBody;
  }
}
