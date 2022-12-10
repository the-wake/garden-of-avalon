import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ServantList from './components/ServantList.js';
import Servant from './components/Servant.js';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Hi</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ServantList />} />
            <Route path="/servants/:id" element={<Servant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
