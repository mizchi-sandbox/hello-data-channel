import Peer from "simple-peer";
import React from "react";
import ReactDOM from "react-dom";

let peer: Peer.Instance = null as any;

class Initiator extends React.Component<
  {
    onHandshaked: () => void;
  },
  {
    incoming: string;
    outgoing: null | string;
  }
> {
  state = {
    incoming: "",
    outgoing: null
  };

  textareaRef: any = React.createRef();

  componentDidMount() {
    peer = new Peer({ initiator: true, trickle: false });

    peer.on("error", (err: any) => {
      console.error(err);
    });

    peer.on("signal", (data: any) => {
      console.log("signal");
      this.setState(s => ({ ...s, outgoing: data }));
    });

    peer.on("connect", () => {
      console.log("CONNECT");
      // peer.send("hey, how is it going?");
      this.props.onHandshaked();
    });

    // peer.on("data", (data: any) => {
    //   console.log("data: " + data);
    // });
    return peer;
  }

  render() {
    return (
      <div>
        {this.state.outgoing && (
          <>
            <textarea
              ref={this.textareaRef as any}
              style={{ width: 600, height: 150, background: "#ddd" }}
              value={JSON.stringify(this.state.outgoing)}
              onChange={() => {
                /**/
              }}
            />

            <button
              onClick={() => {
                this.textareaRef.current.select();
                document.execCommand("copy");
              }}
            >
              Copy to clipboard
            </button>
            <hr />
            <textarea
              style={{ width: 600, height: 150 }}
              value={this.state.incoming}
              onChange={ev => {
                this.setState({ incoming: ev.target.value });
              }}
            />
            <button
              onClick={() => {
                peer.signal(JSON.parse(this.state.incoming));
              }}
            >
              signal
            </button>
          </>
        )}
      </div>
    );
  }
}

class Receiver extends React.Component<
  {
    onHandshaked: () => void;
  },
  {
    incoming: string;
    outgoing: null | string;
  }
> {
  state = {
    mode: null,
    handshaked: false,
    incoming: "",
    outgoing: null
  };

  textareaRef: any = React.createRef();

  componentDidMount() {
    peer = new Peer({ initiator: false, trickle: false });
    peer.on("error", (err: any) => {
      console.log("error", err);
    });

    peer.on("signal", (data: any) => {
      console.log("signal");
      this.setState(s => ({ ...s, outgoing: data }));
    });

    peer.on("connect", () => {
      console.log("CONNECT");
      this.props.onHandshaked();
    });

    return peer;
  }

  render() {
    return (
      <div>
        <div>
          <textarea
            style={{ width: 600, height: 150 }}
            value={this.state.incoming}
            onChange={ev => {
              this.setState({ incoming: ev.target.value });
            }}
          />

          <button
            onClick={() => {
              peer.signal(JSON.parse(this.state.incoming));
            }}
          >
            signal
          </button>
        </div>

        <div>
          {this.state.outgoing && (
            <>
              <textarea
                ref={this.textareaRef as any}
                style={{ width: 600, height: 150, background: "#ddd" }}
                value={JSON.stringify(this.state.outgoing)}
                onChange={() => {
                  /**/
                }}
              />

              <button
                onClick={() => {
                  this.textareaRef.current.select();
                  document.execCommand("copy");
                }}
              >
                Copy to clipboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

class Chat extends React.Component<
  any,
  {
    text: string;
    comments: Array<{
      owner: string;
      text: string;
      date: number;
    }>;
  }
> {
  state = { text: "", comments: [] };

  componentDidMount() {
    peer.on("data", (data: any) => {
      const json = JSON.parse(data);
      this.setState({ comments: json });
    });
  }

  render() {
    return (
      <div>
        <textarea
          value={this.state.text}
          onChange={ev => {
            this.setState({ text: ev.target.value });
          }}
        />

        <button
          onClick={() => {
            const comment = {
              owner: (peer as any)._id,
              text: this.state.text,
              date: Date.now()
            };
            const newComments = [comment, ...this.state.comments];
            peer.send(JSON.stringify(newComments));
            this.setState({ text: "", comments: newComments });
          }}
        >
          send
        </button>

        <ul>
          {this.state.comments.map((c: any, index) => {
            return (
              <li key={index}>
                {c.owner}: {c.text}: {c.date}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

class App extends React.Component<
  {},
  {
    mode: "initiator" | "receiver" | "none" | "connected";
  }
> {
  state = {
    mode: "none"
  } as any;

  render() {
    switch (this.state.mode) {
      case "none": {
        return (
          <div>
            <button
              onClick={() => {
                this.setState({ mode: "initiator" });
              }}
            >
              Create connection
            </button>

            <button
              onClick={() => {
                this.setState({ mode: "receiver" });
              }}
            >
              Receive connection
            </button>
          </div>
        );
      }
      case "initiator": {
        return (
          <Initiator
            onHandshaked={() => {
              this.setState({ mode: "connected" });
            }}
          />
        );
      }
      case "receiver": {
        return (
          <Receiver
            onHandshaked={() => {
              this.setState({ mode: "connected" });
            }}
          />
        );
      }
      case "connected": {
        return <Chat />;
      }
    }
  }
}

ReactDOM.render(
  <>
    <h1>Handshaker</h1>
    <hr />
    <App />
  </>,
  document.querySelector(".root")
);
