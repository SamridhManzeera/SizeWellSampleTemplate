import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Path, pathToRegexp } from 'path-to-regexp';

import AUTH_ROUTES from './AuthRoutes';
import { getPrivateRoutes } from './PrivateRoutes';
import { PUBLIC_ROUTES } from './PublicRoutes';
import { CustomRouter } from './RootRoutes';
import { ProjectType } from '../Shared/Constants';

// Nested routes (react-router `children`) only carry their own relative
// segment, so their title never surfaces via a plain top-level path match.
// This flattens each child's path to its full resolved path (parent + child)
// so titles resolve for nested URLs like /space-requests/:id/workforce too.
function flattenRoutes(routes: CustomRouter[], basePath = ''): CustomRouter[] {
  return routes.flatMap((route): CustomRouter[] => {
    if (!route.path) return [];
    const fullPath =
      route.path === '*'
        ? route.path
        : `${basePath}/${route.path}`.replace(/\/{2,}/g, '/');
    const current: CustomRouter = { ...route, path: fullPath };
    const children = route.children
      ? flattenRoutes(route.children as CustomRouter[], fullPath)
      : [];
    return [current, ...children];
  });
}

// eslint-disable-next-line react/prop-types
/* eslint-disable react/require-default-props */
function DocumentTitle({
  isAuthenticated = false,
  projecttype = null,
}: {
  isAuthenticated?: boolean;
  projecttype?: ProjectType | null;
}) {
  const location = useLocation();
  const ROUTES: CustomRouter[] = flattenRoutes(
    PUBLIC_ROUTES.concat(
      isAuthenticated ? getPrivateRoutes(projecttype) : AUTH_ROUTES
    )
  );
  const matchedRoute: CustomRouter | undefined = ROUTES.find(
    (route: CustomRouter) =>
      route.path !== '*' &&
      pathToRegexp(route.path as Path).test(location.pathname)
  );

  const title = matchedRoute ? matchedRoute.title : '';
  return (
    <Helmet>
      <title>{title}</title>
      <meta />
    </Helmet>
  );
}

export default DocumentTitle;
