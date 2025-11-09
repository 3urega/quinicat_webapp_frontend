import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

export const runtime = 'nodejs';

type SymfonyVerifyResponse = {
  symfonyToken: string;
  expiresAt?: string;
  role?: string;
  user?: {
    id?: string;
    role?: string;
  };
};

async function exchangeSymfonyToken({
  vercelIdToken,
  email,
  name,
  image,
}: {
  vercelIdToken: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}): Promise<SymfonyVerifyResponse | null> {
  const symfonyUrl = process.env.SYMFONY_API_URL;
  if (!symfonyUrl) {
    console.warn('[auth] SYMFONY_API_URL no está definido, se omite el intercambio de token.');
    return null;
  }

  console.log('[auth] Iniciando intercambio con Symfony', {
    endpoint: `${symfonyUrl}/api/webapp/auth/verify-vercel`,
    hasVercelToken: Boolean(vercelIdToken),
    email,
  });

  try {
    const response = await fetch(`${symfonyUrl}/api/webapp/auth/verify-vercel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vercelToken: vercelIdToken,
        email,
        name,
        image,
      }),
    });

    // Leer el cuerpo como texto primero para inspeccionarlo
    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || '';

    // Verificar si la respuesta es JSON válido
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      console.error('[auth] Error al verificar token en Symfony:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: responseText.substring(0, 500), // Limitar a 500 caracteres para no saturar logs
      });
      return null;
    }

    // Validar Content-Type antes de parsear JSON
    if (!isJson) {
      console.error('[auth] Symfony devolvió respuesta no-JSON:', {
        status: response.status,
        contentType,
        bodyPreview: responseText.substring(0, 500),
      });
      return null;
    }

    // Intentar parsear JSON de forma segura
    let payload: SymfonyVerifyResponse;
    try {
      payload = JSON.parse(responseText) as SymfonyVerifyResponse;
    } catch (parseError) {
      console.error('[auth] Error al parsear respuesta JSON de Symfony:', {
        error: parseError,
        contentType,
        bodyPreview: responseText.substring(0, 500),
      });
      return null;
    }

    console.log('[auth] Symfony devolvió token correctamente', {
      hasSymfonyToken: Boolean(payload?.symfonyToken),
      expiresAt: payload?.expiresAt,
      role: payload?.role ?? payload?.user?.role,
    });

    return payload;
  } catch (error) {
    console.error('[auth] Fallo al comunicar con Symfony:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account?.id_token) {
        token.vercelIdToken = account.id_token;
      }

      if (user?.id) {
        token.userId = user.id;
      }

      const shouldExchangeToken = Boolean(account?.id_token);

      if (shouldExchangeToken) {
        const exchangeResult = await exchangeSymfonyToken({
          vercelIdToken: account!.id_token!,
          email: user?.email,
          name: user?.name,
          image: user?.image,
        });

        if (exchangeResult?.symfonyToken) {
          token.symfonyToken = exchangeResult.symfonyToken;
          token.symfonyTokenExpiresAt = exchangeResult.expiresAt;
          token.role = exchangeResult.role ?? exchangeResult.user?.role ?? token.role;
          token.userId = exchangeResult.user?.id ?? token.userId ?? token.sub;
        } else {
          delete token.symfonyToken;
          delete token.symfonyTokenExpiresAt;
        }
      }

      if (trigger === 'update' && session) {
        if (session.symfonyToken) {
          token.symfonyToken = session.symfonyToken;
        }
        if (session.symfonyTokenExpiresAt) {
          token.symfonyTokenExpiresAt = session.symfonyTokenExpiresAt;
        }
        if (session.role) {
          token.role = session.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId ?? token.sub) as string | undefined;
        session.user.symfonyToken = token.symfonyToken as string | undefined;
        session.user.symfonyTokenExpiresAt = token.symfonyTokenExpiresAt as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.vercelIdToken = token.vercelIdToken as string | undefined;
      }

      if (session) {
        (session as any).symfonyToken = (token.symfonyToken as string | undefined) ?? null;
        (session as any).symfonyTokenExpiresAt = token.symfonyTokenExpiresAt as string | undefined;
        (session as any).role = token.role as string | undefined;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
