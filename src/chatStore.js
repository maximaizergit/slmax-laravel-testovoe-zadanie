import { observable, action } from 'mobx';

class ChatStore {
  @observable messages = [];

  @action
  addMessage(message) {
    this.messages.push(message);
  }
}

export default new ChatStore();
