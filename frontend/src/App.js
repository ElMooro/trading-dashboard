import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Macro Intelligence Terminal</h1>
      </header>
      <main>
        <div className="container">
          <section>
            <h2>Global Economic Chart Builder</h2>
            <p>Chart builder component would render here</p>
          </section>
          
          <div className="row">
            <section>
              <h2>Global Risk Heatmap</h2>
              <p>Risk heatmap would render here</p>
            </section>
            
            <section>
              <h2>AI Signal Timeline</h2>
              <p>Timeline component would render here</p>
            </section>
          </div>
          
          <section>
            <h2>Watchlist</h2>
            <p>Watchlist component would render here</p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
