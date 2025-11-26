import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export function apiAdapter(controllerMethod: any) {
  return async (req: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    
    // 1. Parse Body
    let body = {};
    try {
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        body = await req.json();
      }
    } catch {}

    // 2. Parse Query
    const query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => { query[key] = value; });

    // 3. Mock Express Request
    const mockReq = {
      body,
      query,
      params: resolvedParams,
      headers: Object.fromEntries(req.headers.entries()),
      cookies: Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value])),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      user: null, // Will be injected if authenticated
    };

    // 4. Mock Express Response
    let status = 200;
    let responseBody: any = null;
    const headers = new Headers();

    const mockRes = {
      status: (code: number) => { status = code; return mockRes; },
      json: (data: any) => { responseBody = data; return mockRes; },
      cookie: (name: string, value: string, options: any) => {
        cookieStore.set({ name, value, ...options });
        return mockRes;
      },
      clearCookie: (name: string, options: any) => {
        cookieStore.delete(name);
        return mockRes;
      },
      setHeader: (name: string, value: string) => {
        headers.set(name, value);
        return mockRes;
      },
    };

    // 5. Execute Controller
    try {
      await controllerMethod(mockReq, mockRes, () => {});
      return NextResponse.json(responseBody, { status, headers });
    } catch (error: any) {
      console.error("API Adapter Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  };
}