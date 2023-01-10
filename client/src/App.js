import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ServantList from './components/ServantList.js';
import Servant from './components/Servant.js';
import SummonCalc from './pages/SummonCalc.js';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Hi</h1>
          <nav>
            <Link to={"/"}>Home</Link>
            <Link to={"/calculator"}>Summon Calculator</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ServantList />} />
            <Route path="/servants/:id" element={<Servant />} />
            <Route path="/calculator" element={<SummonCalc />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
