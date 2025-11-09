export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-grow bg-gradient-to-br from-primary-green to-primary-yellow">
      <div 
        className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 pointer-events-none"
        aria-hidden="true"
      ></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
} 