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

export function generateUploadUrl(data: { filepath: string; folderId?: number; filename?: string }): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/upload',
    data,
  });
}

export function uploadToMinio(data: { uploadUrl: string; file: any }): Promise<any> {
  return fetch(data.uploadUrl, {
    method: 'PUT',
    body: data.file,
  });
}

export function finishUpload(data: { filepath: string; filename: string }): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/upload/finish',
    data,
  });
}

export function deleteResources(data: { ids: number[] }) {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/delete',
    data,
  });
}

export function deleteFolders(data: { ids: number[] }) {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/folders/delete',
    data,
  });
}

export function moveResources(data: { ids: number[]; folderId: number }) {
  return uni.request({
    method: 'POST',
    url: '/api/v1/resources/move',
    data,
  });
}
