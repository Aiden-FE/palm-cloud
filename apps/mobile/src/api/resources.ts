import { getRequestConfig } from './core';

export function getResourceList(params?: { folderId?: number; filetype?: string }): Promise<any> {
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
  chunkStatus: number[];
  folderId?: number;
}): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/upload/create',
    data,
  });
}

export function uploadResourceChunk(
  file: { name?: string; filePath?: string; file: any },
  formData?: any,
): Promise<any> {
  const { apiHost, headers } = getRequestConfig();
  const fileUrl = URL.createObjectURL(file.file);
  return uni.uploadFile({
    method: 'POST',
    url: `${apiHost}/api/v1/resources/upload/chunk`,
    header: headers,
    name: file.name,
    filePath: fileUrl,
    formData,
  });
}

export function finishUploadResource(data: { taskId: string }): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/upload/merge',
    data,
  });
}

export function createFolder(data: { name: string; parentId?: number }): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/folder/create',
    data,
  });
}

export function getFolders(data?: { folderId?: number }): Promise<any> {
  return uni.request({
    method: 'GET',
    url: '/api/v1/resources/folders',
    data,
  });
}
