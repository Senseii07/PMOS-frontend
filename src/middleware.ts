/**
 * Route middleware — protect all /dashboard/* routes.
 * Unauthenticated requests are redirected to /login.
 */
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
