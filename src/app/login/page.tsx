import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12">
        <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido a QuiniCat</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              La plataforma para los amantes del fútbol local
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              ← Volver a la página de inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 