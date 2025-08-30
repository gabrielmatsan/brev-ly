import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Redirect } from "./pages/Redirect";

function App() {
  useEffect(() => {
    document.title = "Brev.ly - Encurtador de URLs";
  }, []);
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<Home />} />

      {/* Capturar qualquer URL encurtada e redirecionar */}
      <Route path="/:shortUrl" element={<Redirect />} />

      {/* Página 404 para rotas que não seguem o padrão */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
