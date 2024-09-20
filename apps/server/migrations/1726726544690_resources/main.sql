DROP TABLE IF EXISTS `resource_folders`;

DROP TABLE IF EXISTS `resources`;

DROP TABLE IF EXISTS `resource_tags`;

DROP TABLE IF EXISTS `_resource_tags`;

CREATE TABLE
  `resource_folders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL COMMENT '文件夹显示名称',
    `parentId` INTEGER NOT NULL DEFAULT -1 COMMENT '父文件夹，-1 代表根',
    `size` INTEGER NOT NULL DEFAULT 0 COMMENT '文件夹大小',
    `ownerId` INTEGER NOT NULL COMMENT '文件夹拥有者',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `resource_folders_ownerId_parentId_index` (`ownerId`, `parentId`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE
  `resources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL COMMENT '文件显示名称',
    `filePath` VARCHAR(255) NOT NULL COMMENT '文件存储路径',
    `fileType` VARCHAR(32) NOT NULL COMMENT '文件类型',
    `fileSize` INTEGER NOT NULL COMMENT '文件大小',
    `folderId` INTEGER NOT NULL DEFAULT -1 COMMENT '文件所属文件夹',
    `ownerId` INTEGER NOT NULL COMMENT '文件拥有者',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `resources_ownerId_folderId_index` (`ownerId`, `folderId`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE
  `resource_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(16) NOT NULL COMMENT '标签显示名称',
    `color` VARCHAR(16) NOT NULL COMMENT '标签颜色',
    `ownerId` INTEGER NOT NULL COMMENT '标签拥有者',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `resource_tags_ownerId_index` (`ownerId`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE
  `_resource_tags` (
    `resourceId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    PRIMARY KEY (`resourceId`, `tagId`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;