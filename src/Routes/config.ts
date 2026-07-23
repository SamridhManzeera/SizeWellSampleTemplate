import { RouteObject } from 'react-router-dom';
import { ProjectType } from '../Shared/Constants';
import { getPrivateRoutes } from './PrivateRoutes';
import { PUBLIC_ROUTES } from './PublicRoutes';

export const guestRoutes = [...PUBLIC_ROUTES];

export const getAuthenticatedRoutes = (
  projecttype?: ProjectType | null
): Array<RouteObject> => [...getPrivateRoutes(projecttype)];
