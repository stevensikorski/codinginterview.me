import logo from './logo.svg';
import './App.css';
import Register from "./user_registration/registration.jsx"


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Reacts
        </a>
      </header>
      <div className="signup">
        <Register />
      </div>
    </div>
  );
}

export default App;