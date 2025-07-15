// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Consulta en la tabla admins
  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const isAdmin = !!admin && admin.role === "admin";

  // Rutas protegidas por rol
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/perfil") && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/perfil/:path*"],
};
