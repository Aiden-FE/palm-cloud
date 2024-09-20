export interface ResourceFolders {
  id: number;
  name: string;
  parentId: number | -1;
  size: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resources {
  id: number;
  name: string;
  filePath: string;
  size: number;
  folderId: number | -1;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceTags {
  id: number;
  name: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceToTags {
  id: number;
  resourceId: number;
  tagId: number;
}
