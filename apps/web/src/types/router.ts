import 'vue-router';
import type { UserRole } from '@my-modern-app/shared-types';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: UserRole[];
  }
}

export {};
