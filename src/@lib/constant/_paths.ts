import { TId } from '@base/interfaces';

export const Paths = {
  root: '/',
  initiate: '/initiate',
  underConstruction: '/under-construction',
  auth: {
    signIn: '/auth',
    register: '/auth/register',
  },
  admin: {
    root: '/admin',
    users: {
      root: '/admin/users',
      list: '/admin/users/list',
    },
    roleManager: {
      root: '/admin/role-manager',
      permissionTypes: {
        root: '/admin/role-manager/permission-types',
        list: '/admin/role-manager/permission-types/list',
      },
      permissions: {
        root: '/admin/role-manager/permissions',
        list: '/admin/role-manager/permissions/list',
      },
      roles: {
        root: '/admin/role-manager/roles',
        list: '/admin/role-manager/roles/list',
        toId: (id: TId) => `/admin/role-manager/roles/${id}`,
      },
    },
    marketPrice: {
      root: '/admin/market-price',
      list: '/admin/market-price/list',
    },
    categories: {
      root: '/admin/categories',
      list: '/admin/categories/list',
    },
    subCategories: {
      root: '/admin/sub-categories',
      list: '/admin/sub-categories/list',
    },
    authors: {
      root: '/admin/authors',
      list: '/admin/authors/list',
    },
    articles: {
      root: '/admin/articles',
      list: '/admin/articles/list',
      create: '/admin/articles/create',
      published: '/admin/articles/published',
      drafted: '/admin/articles/drafted',
      archived: '/admin/articles/archived',
      featured: '/admin/articles/featured',
      exclusive: '/admin/articles/exclusive',
    },
    tags: {
      root: '/admin/tags',
      list: '/admin/tags/list',
      create: '/admin/tags/create',
    },
    polls: {
      root: '/admin/polls',
      list: '/admin/polls/list',
    },
    ads: {
      root: '/admin/ads',
      list: '/admin/ads/list',
    },
    entrepreneurs: {
      root: '/admin/entrepreneurs',
      list: '/admin/entrepreneurs/list',
    },
    startups: {
      root: '/admin/startups',
      list: '/admin/startups/list',
    },
    locations: {
      root: '/admin/locations',
      list: '/admin/locations/list',
    },
    cms: {
      root: '/admin/cms',
      menus: {
        root: '/admin/cms/menus',
        list: '/admin/cms/menus/list',
      },
      pages: {
        root: '/admin/cms/pages',
        list: '/admin/cms/pages/list',
      },
      layout: {
        root: '/admin/cms/layout',
      },
    },
    settings: {
      root: '/admin/settings',
    },
  },
};
