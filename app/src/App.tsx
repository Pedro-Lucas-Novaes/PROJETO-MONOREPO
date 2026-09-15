import "./App.css";
import { Button } from "./components/button.tsx";

function App() {
  return (
    <>
      <Button variant="primary">Cadastrar</Button>
      <Button variant="secondary">Resetar</Button>
      <Button variant="danger">Deletar</Button>
    </>
  );
}
export default App;
