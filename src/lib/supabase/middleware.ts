import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { getProfileForAdminMiddleware } from "@/lib/supabase/middleware-admin-profile";
import type { Database } from "@/types/database";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/institutions") ||
    pathname.startsWith("/suppliers")
  );
}

function isAuthOnlyWhenGuest(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

async function getProfileForUser(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", userId)
    .single();

  return profile;
}

function redirectForInstructorApproval(
  profile: { role: string; approval_status: string } | null,
  request: NextRequest,
): NextResponse | null {
  if (profile?.role === "instructor" && profile.approval_status === "pending") {
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }
  if (profile?.role === "instructor" && profile.approval_status === "rejected") {
    return NextResponse.redirect(new URL("/account-rejected", request.url));
  }
  return null;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (user && isAuthOnlyWhenGuest(pathname)) {
    const profile = await getProfileForUser(supabase, user.id);
    const approvalRedirect = redirectForInstructorApproval(profile, request);
    if (approvalRedirect) {
      return approvalRedirect;
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin/")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const profile = await getProfileForAdminMiddleware(user.id, user.email);
    const approvalRedirect = redirectForInstructorApproval(profile, request);
    if (approvalRedirect) {
      return approvalRedirect;
    }

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isProtectedPath(pathname)) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const profile = await getProfileForUser(supabase, user.id);
    const approvalRedirect = redirectForInstructorApproval(profile, request);
    if (approvalRedirect) {
      return approvalRedirect;
    }
  }

  if (
    (pathname === "/pending-approval" || pathname === "/account-rejected") &&
    !user
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/pending-approval") {
    const profile = await getProfileForUser(supabase, user.id);
    if (profile?.role === "admin" || profile?.approval_status === "approved") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (profile?.approval_status === "rejected") {
      return NextResponse.redirect(new URL("/account-rejected", request.url));
    }
  }

  return supabaseResponse;
}
