import logo from './logo.svg';
import './App.css';
import React, { Component,useState  } from "react";


export default class App extends Component {
  static displayName = App.name;
  
  constructor(props) {
    super(props);
    this.state = {
      value:null
    }

  }
  getAccount = async () => {
    const showAccount = document.querySelector('.showAccount');
    
    if(window.ethereum)
    {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    this.setState({value:account});
  }
  else
  {
    this.setState({value:"Please Install Wallet!"});
  }
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button onClick={this.getAccount}>Connect Wallet</button>
          <h2>Account: <span>{this.state.value}</span></h2>
        </header>
      </div>
    );
  }
}
