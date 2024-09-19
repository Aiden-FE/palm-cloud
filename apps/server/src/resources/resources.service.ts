import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourcesService {
  getResourcesList() {
    return [
      {
        id: 1,
        name: 'resource1',
      },
      {
        id: 2,
        name: 'resource2',
      },
    ];
  }
}
