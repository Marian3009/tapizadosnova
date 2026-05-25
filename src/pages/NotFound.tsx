import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[hsl(40,25%,97%)] px-4 text-center">
      <div className="space-y-1">
        <p className="font-['Playfair_Display'] text-[hsl(39,44%,59%)] text-sm uppercase tracking-widest font-semibold">
          Error 404
        </p>
        <h1 className="font-['Playfair_Display'] text-5xl font-bold text-[hsl(222,17%,20%)]">
          Página no encontrada
        </h1>
        <p className="mt-3 text-[hsl(222,10%,40%)] max-w-sm mx-auto">
          La página que buscas no existe o ha sido movida.
        </p>
      </div>
      <a
        href="/"
        className="rounded-xl bg-[hsl(222,17%,20%)] px-8 py-3 font-semibold text-[hsl(40,25%,97%)] shadow-md transition hover:bg-[hsl(222,17%,14%)]"
      >
        Volver al inicio
      </a>
    </div>
  );
};

export default NotFound;
