import CustomLink from "@base/components/CustomLink";
import { Paths, Permissions } from "@lib/constant";
import { Toolbox } from "@lib/utils";
import { getContentAccess } from "@modules/auth/lib/utils/client";
import { Menu } from "antd";
import {
  FaArchive,
  FaPlusCircle,
  FaTools,
  FaUserEdit,
  FaUsers,
  FaUserShield,
  FaUserTag,
} from "react-icons/fa";
import { CiCircleList } from "react-icons/ci";
import { GrUserAdmin } from "react-icons/gr";
import { TiInputChecked } from "react-icons/ti";
import {
  MdNewspaper,
  MdOutlineFeaturedVideo,
  MdLabelImportantOutline,
} from "react-icons/md";

import {
  MdCategory,
  MdDashboard,
  MdLocationOn,
  MdOutlineAdsClick,
  MdOutlineDrafts,
  MdOutlinePriceChange,
  MdTag,
} from "react-icons/md";
import { RiArticleLine, RiUserStarFill } from "react-icons/ri";

interface IProps {
  className?: string;
  selectedKeys: string[];
  openKeys: string[];
  onOpenChange: (openKeys: string[]) => void;
}

const AdminMenu: React.FC<IProps> = ({
  className,
  selectedKeys,
  openKeys,
  onOpenChange,
}) => {
  return (
    <Menu
      className={className}
      mode="inline"
      theme="light"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      items={[
        {
          key: Paths.admin.root,
          icon: <MdDashboard />,
          label: <CustomLink href={Paths.admin.root}>Dashboard</CustomLink>,
        },
        getContentAccess({
          content: {
            key: Paths.admin.users.list,
            icon: <FaUsers />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.users.list)}
              >
                Users
              </CustomLink>
            ),
          },
          allowedAccess: ["users:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.roleManager.root,
            icon: <FaUserShield />,
            label: "Role Manager",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.permissionTypes.list,
                  icon: <RiUserStarFill />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.permissionTypes.list,
                      )}
                    >
                      Permission Types
                    </CustomLink>
                  ),
                },
                allowedAccess: ["role-manager-permission-types:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.permissions.list,
                  icon: <FaUserTag />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.permissions.list,
                      )}
                    >
                      Permissions
                    </CustomLink>
                  ),
                },
                allowedAccess: ["role-manager-permissions:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.roleManager.roles.list,
                  icon: <GrUserAdmin />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.roleManager.roles.list,
                      )}
                    >
                      Roles
                    </CustomLink>
                  ),
                },
                allowedAccess: ["role-manager-roles:read"],
              }),
            ],
          },
          allowedAccess: [
            "role-manager-permission-types:read",
            "role-manager-permissions:read",
            "role-manager-roles:read",
          ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.categories.list,
            icon: <MdCategory />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.categories.list)}
              >
                Categories
              </CustomLink>
            ),
          },
          allowedAccess: ["categories:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.subCategories.list,
            icon: <MdCategory />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.subCategories.list)}
              >
                Sub Categories
              </CustomLink>
            ),
          },
          allowedAccess: ["sub-categories:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.authors.list,
            icon: <FaUserEdit />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.authors.list)}
              >
                Authors
              </CustomLink>
            ),
          },
          allowedAccess: ["authors:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.tags.root,
            icon: <MdTag />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.tags.root)}
              >
                Tags
              </CustomLink>
            ),
          },
          allowedAccess: [Permissions.TAGS_READ],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.articles.root,
            icon: <RiArticleLine />,
            label: "Articles",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.articles.create,
                  icon: <FaPlusCircle />,
                  label: (
                    <CustomLink href={Paths.admin.articles.create}>
                      Create
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:write"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.featured,
                  icon: <MdOutlineFeaturedVideo />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.articles.featured,
                      )}
                    >
                      Featured
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.exclusive,
                  icon: <MdLabelImportantOutline />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.articles.exclusive,
                      )}
                    >
                      Lead Articles
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.published,
                  icon: <TiInputChecked />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.articles.published,
                      )}
                    >
                      Published
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.drafted,
                  icon: <MdOutlineDrafts />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.articles.drafted,
                      )}
                    >
                      Drafted
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.archived,
                  icon: <FaArchive />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(
                        Paths.admin.articles.archived,
                      )}
                    >
                      Archived
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.video.root,
                  icon: <MdOutlineFeaturedVideo />,
                  label: "Video Articles",
                  children: [
                    getContentAccess({
                      content: {
                        key: Paths.admin.articles.video.create,
                        icon: <FaPlusCircle />,
                        label: (
                          <CustomLink href={Paths.admin.articles.video.create}>
                            Create Video
                          </CustomLink>
                        ),
                      },
                      allowedAccess: ["articles:write"],
                    }),
                    getContentAccess({
                      content: {
                        key: Paths.admin.articles.video.list,
                        icon: <CiCircleList />,
                        label: (
                          <CustomLink
                            href={Toolbox.appendPagination(
                              Paths.admin.articles.video.list,
                            )}
                          >
                            Video List
                          </CustomLink>
                        ),
                      },
                      allowedAccess: ["articles:read"],
                    }),
                  ],
                },
                allowedAccess: ["articles:read", "articles:write"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.photo.root,
                  icon: <MdOutlineFeaturedVideo />,
                  label: "Photo Articles",
                  children: [
                    getContentAccess({
                      content: {
                        key: Paths.admin.articles.photo.create,
                        icon: <FaPlusCircle />,
                        label: (
                          <CustomLink href={Paths.admin.articles.photo.create}>
                            Create Photo
                          </CustomLink>
                        ),
                      },
                      allowedAccess: ["articles:write"],
                    }),
                    getContentAccess({
                      content: {
                        key: Paths.admin.articles.photo.list,
                        icon: <CiCircleList />,
                        label: (
                          <CustomLink
                            href={Toolbox.appendPagination(
                              Paths.admin.articles.photo.list,
                            )}
                          >
                            Photo List
                          </CustomLink>
                        ),
                      },
                      allowedAccess: ["articles:read"],
                    }),
                  ],
                },
                allowedAccess: ["articles:read", "articles:write"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.articles.list,
                  icon: <CiCircleList />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(Paths.admin.articles.list)}
                    >
                      List
                    </CustomLink>
                  ),
                },
                allowedAccess: ["articles:read"],
              }),
            ],
          },
          allowedAccess: ["articles:read", "articles:write"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.ads.list,
            icon: <MdOutlineAdsClick />,
            label: (
              <CustomLink href={Toolbox.appendPagination(Paths.admin.ads.list)}>
                Ads
              </CustomLink>
            ),
          },
          allowedAccess: ["ads:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.marketPrice.list,
            icon: <MdOutlinePriceChange />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.marketPrice.list)}
              >
                Market Price
              </CustomLink>
            ),
          },
          allowedAccess: ["market-prices:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.locations.list,
            icon: <MdLocationOn />,
            label: (
              <CustomLink
                href={Toolbox.appendPagination(Paths.admin.locations.list)}
              >
                Locations
              </CustomLink>
            ),
          },
          allowedAccess: ["locations:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.epapers.list,
            icon: <MdNewspaper />,
            label: "E-Papers",
            children: [
              getContentAccess({
                content: {
                  key: Paths.admin.epapers.list,
                  icon: <MdNewspaper />,
                  label: (
                    <CustomLink
                      href={Toolbox.appendPagination(Paths.admin.epapers.list)}
                    >
                      Traditional
                    </CustomLink>
                  ),
                },
                allowedAccess: ["epapers:read"],
              }),
              getContentAccess({
                content: {
                  key: Paths.admin.epaperVisual.list,
                  icon: <RiArticleLine />,
                  label: (
                    <CustomLink href={Paths.admin.epaperVisual.list}>
                      Visual
                    </CustomLink>
                  ),
                },
                allowedAccess: ["epaper-visual:read"],
              }),
            ],
          },
          allowedAccess: ["epapers:read", "epaper-visual:read"],
        }),
        getContentAccess({
          content: {
            key: Paths.admin.settings.root,
            icon: <FaTools />,
            label: (
              <CustomLink href={Paths.admin.settings.root}>Settings</CustomLink>
            ),
          },
          allowedAccess: ["settings:read"],
        }),
      ]}
    />
  );
};

export default AdminMenu;
