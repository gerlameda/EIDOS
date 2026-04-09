import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rutas que requieren sesión autenticada (no anónima).
 * Cualquier sub-ruta de estas también queda protegida.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/modulo01",
  "/modulo02",
  "/modulo03",
  "/modulo04",
];

/**
 * Rutas públicas que siempre pasan sin verificación.
 * El orden importa: se evalúan de arriba hacia abajo.
 */
const PUBLIC_PREFIXES = [
  "/auth",       // callbacks de magic link
  "/login",      // página de login
  "/onboarding", // flujo inicial (puede incluir anónimos)
  "/_next",      // assets internos de Next.js
  "/favicon",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  // Creamos la respuesta base que el middleware va a devolver.
  // Es importante mantenerla mutable para que Supabase pueda
  // actualizar las cookies de sesión en cada request.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Primero actualizamos las cookies en el request...
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // ...luego creamos una nueva respuesta con el request actualizado
          // y aplicamos las cookies con sus opciones completas.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // Rutas públicas: dejamos pasar sin verificar sesión,
  // pero igual llamamos getUser() para refrescar el token si existe.
  if (isPublic(pathname)) {
    await supabase.auth.getUser();
    return response;
  }

  // Rutas protegidas: verificamos que haya un usuario real (no anónimo).
  if (isProtected(pathname)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthenticated = user !== null && user.is_anonymous !== true;

    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      // Guardamos la URL de destino para redirigir después del login.
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Para cualquier otra ruta (e.g. "/") dejamos pasar normalmente.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto:
     * - Archivos estáticos de Next.js (_next/static, _next/image)
     * - Imágenes y assets del directorio /public
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
