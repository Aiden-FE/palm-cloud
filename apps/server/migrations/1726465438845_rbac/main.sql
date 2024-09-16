DROP TABLE IF EXISTS `permissions`;

-- 创建权限表
CREATE TABLE
  `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(128) NOT NULL COMMENT '权限的唯一key',
    `name` VARCHAR(24) NOT NULL COMMENT '权限显示名称',
    `description` VARCHAR(255) NULL COMMENT '权限详细描述',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `permissions_key_unique` (`key`),
    INDEX `permissions_name_index` (`name`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `roles`;

-- 创建角色表
CREATE TABLE
  `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(24) NOT NULL COMMENT '角色名称',
    `is_system` BOOLEAN NOT NULL DEFAULT false COMMENT '是否为系统角色',
    `description` VARCHAR(255) NULL COMMENT '角色详细描述',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `roles_name_index` (`name`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;

-- 创建用户表
CREATE TABLE
  `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(128) NOT NULL COMMENT '用户唯一uid',
    `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否启用',
    `country_code` VARCHAR(8) NOT NULL DEFAULT '86' COMMENT '国家代码',
    `telephone` VARCHAR(20) NULL COMMENT '手机号码',
    `password` VARCHAR(255) NULL COMMENT '登录密码',
    `email` VARCHAR(255) NULL COMMENT '邮箱',
    `name` VARCHAR(50) NULL COMMENT '真实姓名',
    `nickname` VARCHAR(24) NULL COMMENT '昵称',
    `gender` INTEGER NULL COMMENT '性别',
    `birthday` DATE NULL COMMENT '出生日期',
    `created_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `users_uid_unique` (`uid`),
    UNIQUE INDEX `users_email_unique` (`email`),
    INDEX `users_country_code_telephone_email_password_index` (`country_code`, `telephone`, `email`, `password`),
    PRIMARY KEY (`id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户角色关系表
DROP TABLE IF EXISTS `_user_roles`;

CREATE TABLE
  `_user_roles` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建角色权限关系表
DROP TABLE IF EXISTS `_role_permissions`;

CREATE TABLE
  `_role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_key` INTEGER NOT NULL,
    PRIMARY KEY (`role_id`, `permission_key`)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;