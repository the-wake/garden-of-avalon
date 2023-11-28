import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import { useSelector, useDispatch } from 'react-redux'
import { getAllServants, addServant, removeServant } from './features/servant/servantSlice.js';

import ServantList from './components/ServantList.js';
import Servant from './components/Servant.js';
import SummonCalc from './pages/SummonCalc.js';
import Header from './components/Header.js';

import './App.css';

function App() {
  const servantData = useSelector((state) => state.servants.roster);
  const loading = useSelector((state) => state.servants.loading);
  console.log(servantData);

  const dispatch = useDispatch();

  const style = {
    background: '#FEFEFE',
    minHeight: '100vh',
  };

  useEffect(() => {
    fetch('https://api.atlasacademy.io/export/JP/basic_servant_lang_en.json')
      .then(response => response.json())
      .then(servants => {
        console.log(servants);

        // First Hassan ends up out of alphabetical order due to quotation marks, so we sanitize the data before passing it to the redux store.
        const treatedServants = [...servants].map((servant, pos) => {
          if (servant.name[0] === '"') {
            return { ...servant, name: servant.name.split('"')[1] };
          } else {
            return servant;
          };
        });
        console.log(treatedServants);

        dispatch(getAllServants(treatedServants));
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div style={style}>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="*" element={<SummonCalc />} /> */
              {/* <Route path="/" element={<ServantList />} />
              <Route path="/servants/:id" element={<Servant />} />
              <Route path="/calculator" element={<SummonCalc />} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
