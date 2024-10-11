import { getRequestConfig } from './core';

export function getResourceList(params?: { folderId?: number }): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources',
    data: {
      ...params,
    },
  });
}

export function getResourceById(id: number): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/info',
    data: { id },
  });
}

export function createUploadTask(data: {
  filename: string;
  filesize: number;
  filetype: string;
  folderId?: number;
}): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/upload/create',
    data,
  });
}

export function uploadResources(file: { name: string; filePath: string; file: File }): Promise<any> {
  const { apiHost, headers } = getRequestConfig();
  return uni.uploadFile({
    method: 'POST',
    url: `${apiHost}/api/v1/resources/upload`,
    header: headers,
    name: file.name,
    filePath: file.filePath,
    file: file.file,
  });
}