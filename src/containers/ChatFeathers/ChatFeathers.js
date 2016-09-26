import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import app from 'app';
import { addMessage } from 'redux/modules/chat';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';
import NavItem from 'react-bootstrap/lib/NavItem';

@connect(
  state => ({
    user: state.auth.user,
    messages: state.chat.messages
  }),
  { addMessage }
)
export default class ChatFeathers extends Component {
  static navbarItem = {
    pos: 1,
    item: ({ user }) => (
      user && <LinkContainer to="/chatFeathers">
        <NavItem>Chat with Feathers</NavItem>
      </LinkContainer>
    )
  };

  static propTypes = {
    user: PropTypes.object,
    addMessage: PropTypes.func,
    messages: PropTypes.array
  };

  state = {
    message: '',
    error: null
  };

  componentDidMount() {
    const messageService = app.service('messages');
    // Find the last 25 messages
    messageService.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    }).then(page => this.props.addMessage(page.data.reverse()));
    // Listen to newly created messages
    messageService.on('created', this.props.addMessage);
  }

  componentWillUnmount() {
    app.service('messages').removeListener('created', this.props.addMessage);
  }

  handleSubmit = event => {
    event.preventDefault();
    app.service('messages').create({ text: this.state.message })
      .then(() => this.setState({ message: '', error: false }))
      .catch(error => this.setState({ error: error.message || false }));
  }

  render() {
    const { user, messages } = this.props;
    const { error } = this.state;

    return (
      <div className="container">
        <h1>Chat</h1>

        {user && <div>
          <ul>
            {messages.map(msg => <li key={`chat.msg.${msg._id}`}>{msg.sentBy.email}: {msg.text}</li>)}
          </ul>
          <form className="login-form" onSubmit={this.handleSubmit}>
            <input
              type="text" ref={c => { this.message = c; }} placeholder="Enter your message" value={this.state.message}
              onChange={event => this.setState({ message: event.target.value })}
            />
            <button className="btn" onClick={this.handleSubmit}>Send</button>
            {error && <div className="text-danger">{error}</div>}
          </form>
        </div>
        }
      </div>
    );
  }
}
