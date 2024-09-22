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
    url: `/api/v1/resources/info`,
    data: { id },
  });
}
