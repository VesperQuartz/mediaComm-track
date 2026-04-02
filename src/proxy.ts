import { type NextRequest, NextResponse } from "next/server";

export async function proxy(_request: NextRequest) {
  // const sessionCookie = getSessionCookie(request);
  // console.log("cookies", sessionCookie);
  //
  // if (!sessionCookie) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  //
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
