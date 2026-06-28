export type TPermission = (typeof Permissions)[keyof typeof Permissions];

export const Permissions = {
  FORBIDDEN: 'FORBIDDEN',

  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  ROLE_MANAGER_PERMISSION_TYPES_READ: 'role-manager-permission-types:read',
  ROLE_MANAGER_PERMISSION_TYPES_WRITE: 'role-manager-permission-types:write',
  ROLE_MANAGER_PERMISSION_TYPES_UPDATE: 'role-manager-permission-types:update',
  ROLE_MANAGER_PERMISSION_TYPES_DELETE: 'role-manager-permission-types:delete',

  ROLE_MANAGER_PERMISSIONS_READ: 'role-manager-permissions:read',
  ROLE_MANAGER_PERMISSIONS_WRITE: 'role-manager-permissions:write',
  ROLE_MANAGER_PERMISSIONS_UPDATE: 'role-manager-permissions:update',
  ROLE_MANAGER_PERMISSIONS_DELETE: 'role-manager-permissions:delete',

  ROLE_MANAGER_ROLES_READ: 'role-manager-roles:read',
  ROLE_MANAGER_ROLES_WRITE: 'role-manager-roles:write',
  ROLE_MANAGER_ROLES_UPDATE: 'role-manager-roles:update',
  ROLE_MANAGER_ROLES_DELETE: 'role-manager-roles:delete',

  CATEGORIES_READ: 'categories:read',
  CATEGORIES_WRITE: 'categories:write',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  SUB_CATEGORIES_READ: 'sub-categories:read',
  SUB_CATEGORIES_WRITE: 'sub-categories:write',
  SUB_CATEGORIES_UPDATE: 'sub-categories:update',
  SUB_CATEGORIES_DELETE: 'sub-categories:delete',

  AUTHORS_READ: 'authors:read',
  AUTHORS_WRITE: 'authors:write',
  AUTHORS_UPDATE: 'authors:update',
  AUTHORS_DELETE: 'authors:delete',

  TAGS_READ: 'tags:read',
  TAGS_WRITE: 'tags:write',
  TAGS_UPDATE: 'tags:update',
  TAGS_DELETE: 'tags:delete',

  ARTICLES_READ: 'articles:read',
  ARTICLES_WRITE: 'articles:write',
  ARTICLES_UPDATE: 'articles:update',
  ARTICLES_DELETE: 'articles:delete',
  ARTICLES_CHANGE_STATUS: 'articles:change-status',

  POLLS_READ: 'polls:read',
  POLLS_WRITE: 'polls:write',
  POLLS_UPDATE: 'polls:update',
  POLLS_DELETE: 'polls:delete',

  ADS_READ: 'ads:read',
  ADS_WRITE: 'ads:write',
  ADS_UPDATE: 'ads:update',
  ADS_DELETE: 'ads:delete',

  ENTREPRENEURS_READ: 'entrepreneurs:read',
  ENTREPRENEURS_WRITE: 'entrepreneurs:write',
  ENTREPRENEURS_UPDATE: 'entrepreneurs:update',
  ENTREPRENEURS_DELETE: 'entrepreneurs:delete',

  STARTUPS_READ: 'startups:read',
  STARTUPS_WRITE: 'startups:write',
  STARTUPS_UPDATE: 'startups:update',
  STARTUPS_DELETE: 'startups:delete',

  CMS_MENUS_READ: 'cms-menus:read',
  CMS_MENUS_WRITE: 'cms-menus:write',
  CMS_MENUS_UPDATE: 'cms-menus:update',
  CMS_MENUS_DELETE: 'cms-menus:delete',

  CMS_PAGES_READ: 'cms-pages:read',
  CMS_PAGES_WRITE: 'cms-pages:write',
  CMS_PAGES_UPDATE: 'cms-pages:update',
  CMS_PAGES_DELETE: 'cms-pages:delete',

  CMS_LAYOUT_READ: 'cms-layout:read',
  CMS_LAYOUT_WRITE: 'cms-layout:write',
  CMS_LAYOUT_UPDATE: 'cms-layout:update',
  CMS_LAYOUT_DELETE: 'cms-layout:delete',

  MARKET_PRICES_READ: 'market-prices:read',
  MARKET_PRICES_WRITE: 'market-prices:write',
  MARKET_PRICES_UPDATE: 'market-prices:update',
  MARKET_PRICES_DELETE: 'market-prices:delete',

  SETTINGS_READ: 'settings:read',

  LOCATIONS_READ: 'locations:read',
  LOCATIONS_WRITE: 'locations:write',
  LOCATIONS_UPDATE: 'locations:update',
  LOCATIONS_DELETE: 'locations:delete',

  EPAPERS_READ: 'epapers:read',
  EPAPERS_WRITE: 'epapers:write',
  EPAPERS_UPDATE: 'epapers:update',
  EPAPERS_DELETE: 'epapers:delete',
  EPAPERS_VISUAL: 'epapers:visual',

  EPAPER_VISUAL_READ: 'epaper-visual:read',
  EPAPER_VISUAL_WRITE: 'epaper-visual:write',
  EPAPER_VISUAL_UPDATE: 'epaper-visual:update',
  EPAPER_VISUAL_DELETE: 'epaper-visual:delete',

  SPECIAL_EVENTS_READ: 'special-events:read',
  SPECIAL_EVENTS_WRITE: 'special-events:write',
  SPECIAL_EVENTS_UPDATE: 'special-events:update',
  SPECIAL_EVENTS_DELETE: 'special-events:delete',
} as const;
