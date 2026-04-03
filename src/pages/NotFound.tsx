const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Página no encontrada
        </p>
        <a
          href="/"
          className="inline-block text-primary underline hover:text-primary/90 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
};

export default NotFound;
