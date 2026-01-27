import React, { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ProductsPage } from "@/features/products/ProductsPage";
import RegisterLinkPage from "@/features/auth/pages/RegisterLinkPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CompositionPage } from "@/features/dashboard/CompositionPage";
import { MenusPage } from "@/features/menus/pages/MenusPage";
import { OnboardingPage } from "@/features/onboarding/pages/OnboardingPage";

const TanStackRouterDevtools =
  import.meta.env.PROD
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});

import { authService } from "@/features/auth/services/auth.service";

// main
const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: MainLayout,
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw redirect({
        to: '/auth/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    try {
        // Validate token and get user info
        const user = await authService.getMe()
        
        // Check onboarding status
        if (user.onboarding_status !== 'completed') {
           throw redirect({ to: '/onboarding' })
        }

    } catch (error) {
        if (error instanceof Response) throw error;
        // If validation fails, clear storage and redirect
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        throw redirect({
            to: '/auth/sign-in',
            search: {
              redirect: location.href,
            },
        })
    }
  },
});

// Create a separate route for onboarding to avoid layout issues or easier control
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
  beforeLoad: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw redirect({ to: '/auth/sign-in' })
    }
    try {
       const user = await authService.getMe()
       if (user.onboarding_status === 'completed') {
         throw redirect({ to: '/dashboard' })
       }
    } catch(e) {
       // if error or redirect thrown above
       if (e instanceof Response) throw e; 
       throw redirect({ to: '/auth/sign-in' })
    }
  }
});


// children routes main
const indexRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/",
  component: () => <div className="p-4 bg-white rounded shadow"><h1>Home Page</h1><p>Welcome to FitPilot</p></div>,
});

const productsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/diets",
  component: ProductsPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const compositionRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/composition",
  component: CompositionPage,
});

const menusRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/menus",
  component: MenusPage,
});

// auth
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthLayout,
});

// children routes auth
const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/sign-in",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/sign-up",
  component: RegisterPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

const registerLinkRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/complete-registration",
  component: RegisterLinkPage,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([indexRoute, productsRoute, dashboardRoute, compositionRoute, menusRoute]),
  authLayoutRoute.addChildren([loginRoute, registerRoute, forgotPasswordRoute, registerLinkRoute]),
  onboardingRoute, // Add onboarding route
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
