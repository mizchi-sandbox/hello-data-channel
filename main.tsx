import Peer from "simple-peer";

import React from "react";
import ReactDOM from "react-dom";

let peer: Peer.Instance = null as any;
// let otherPeer: Peer.Instance = null as any
class App extends React.Component {
  state = {
    incoming: "",
    outgoing: null
  };
  componentDidMount() {
    peer = new Peer({
      initiator: location.hash === "#1",
      trickle: false
    });
    // otherPeer = new Peer({
    //   initiator: false,
    //   trickle: false
    // });

    peer.on("error", (err: any) => {
      console.log("error", err);
    });

    peer.on("signal", (data: any) => {
      console.log("SIGNAL", JSON.stringify(data));
      this.setState(s => ({ ...s, outgoing: data }));
    });

    peer.on("connect", () => {
      console.log("CONNECT");
      peer.send("whatever" + Math.random());
    });

    peer.on("data", (data: any) => {
      console.log("data: " + data);
    });
  }

  render() {
    return (
      <div>
        <h1>Handshake</h1>
        <form
          onSubmit={(ev: any) => {
            ev.preventDefault();
            peer.signal(JSON.parse(this.state.incoming));
          }}
        >
          <textarea
            value={this.state.incoming}
            onChange={ev => this.setState({ incoming: ev.target.value })}
          />
          <button type="submit">submit</button>
        </form>
        {this.state.outgoing && (
          <textarea
            disabled
            style={{ width: 600, height: 200 }}
            defaultValue={JSON.stringify(this.state.outgoing)}
          />
        )}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector(".root"));
