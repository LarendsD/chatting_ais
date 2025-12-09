import WebSocket from 'ws';
import Message, { MessageBase, ResponseByCommand } from './types/message.type.js';
import Command from './enums/Command.enum.js';
import AddTurnCommand, { AddTurnHuman } from './types/commands/AddTurnCommand.type.js';
import UpdateTurnCommand, { UpdateTurnFinal } from './types/commands/UpdateTurnCommand.type.js';
import TurnState from './enums/TurnState.enum.js';

type RequestCommands = 
  Command.CreateAndGenerateTurn | 
  Command.GenerateTurn | 
  Command.CreateChat |
  Command.EditTurn |
  Command.UpdatePrimary;

type TimeoutPromise<T extends RequestCommands = RequestCommands> = {
  instance: NodeJS.Timeout,
  resolve: (value: ResponseByCommand<T>) => void,
  reject: (message: string) => void,
}

export class WebSocketClient {
  private client?: WebSocket;
  private timeoutsMap = new Map<string, TimeoutPromise>();

  connect(url: string, cookies: string) {
    this.client = new WebSocket(url, {
      headers: {
        Cookie: cookies,
      },
    });

    this.client.once('open', () => {
      console.log(`Messaging websocket connecton established for ${url}!`);
      
      setInterval(() => {
        console.log('Ping...');

        this.client?.ping();
      }, 30 * 60 * 1000)
    })

    this.client.on('message', (data) => {
      const message = this.messageToJson(data);

      if (!message) {
        return;
      }

      console.log('Received message:');
      console.log(`Request id ${message.request_id}`);
      console.log(`Command: ${message.command}`);

      switch (message.command) {
        case Command.AddTurn: 
          return this.processAddTurn(message);
        case Command.UpdateTurn:
          return this.processUpdateTurn(message);
        case Command.CreateAndGenerateTurn:
          return this.processCreateAndGenerateTurn(message);
        case Command.GenerateTurn:
          return this.processGenerateTurn(message);
        case Command.CreateChat:
          return this.processCreateChat(message);
        case Command.CreateChatResponse:
          return this.processCreateChatResponse(message);
        case Command.Ok:
          return this.processOk(message);
        case Command.NeoError:
          return this.processNeoError(message);
        default:
          return this.processDefault(message);
      }
    })
  }

  private isHumanTurn(turn: AddTurnCommand): turn is AddTurnHuman {
    return turn.turn.author.is_human;
  }

  private isFinalTurn(turn: UpdateTurnCommand): turn is UpdateTurnFinal {
    return turn.turn.candidates[0].is_final;
  }

  private processOk(
    message: MessageBase<Command.Ok>
  ) {
    console.log('Ok received!');
    console.log(message);
  }

  private processDefault(
    message: MessageBase<unknown>,
  ) {
    console.error('Unknown message!');
    console.error(message);
  }

  private processAddTurn(
    message: MessageBase<Command.AddTurn>,
  ) {
    const timeout = this.timeoutsMap.get(message.request_id);

    if (message.turn.state !== TurnState.StateOk) {
      console.error('Something went wrong while sending message!');

      clearTimeout(timeout?.instance);
      timeout?.reject(`Something went wrong while sending message! Message state: ${message.turn.state}`);

      this.timeoutsMap.delete(message.request_id);

      return;
    }

    if (this.isHumanTurn(message)) {
      console.log('Message has been accepted!');
    } else {
      console.log('Message is processing...');
      
      const firstCandidate = message.turn.candidates[0];

      console.log(`Model type ${firstCandidate.model_type}`);
      console.log(`Generating message: ${firstCandidate.raw_content}`);
    }

    timeout?.instance.refresh();
  }

  private processUpdateTurn(
    message: MessageBase<Command.UpdateTurn>,
  ) {
    const timeout = this.timeoutsMap.get(message.request_id);

    const firstCandidate = message.turn.candidates[0];

    console.log(`Model type ${firstCandidate.model_type}`);
    console.log(`Generating message: ${firstCandidate.raw_content}`);

    if (this.isFinalTurn(message)) {
      console.log('Message generated!');

      timeout?.resolve(message);
    } else {
      console.log('Message is processing...');

      timeout?.instance.refresh();
    }
  }

  private processCreateAndGenerateTurn(
    message: MessageBase<Command.CreateAndGenerateTurn>,
  ) {
    console.log('Request to create and generate turn');

    console.log(message);
  }

  private processCreateChat(
    message: MessageBase<Command.CreateChat>
  ) {
    console.log('Request to create chat');

    console.log(message);
  }

  private processCreateChatResponse(
    message: MessageBase<Command.CreateChatResponse>
  ) {
    const timeout = this.timeoutsMap.get(message.request_id);

    console.log(`Model type: ${message.chat.preferred_model_type}`);

    console.log('Chat created!');

    timeout?.resolve(message);
  }

  private processGenerateTurn(message: MessageBase<Command.GenerateTurn>) {
    console.log('Request to generate turn');

    console.log(message);
  }

  private processNeoError(
    message: MessageBase<Command.NeoError>,
  ) {
    const timeout = this.timeoutsMap.get(message.request_id);

    console.error('Received error!');
    console.error(message.comment);

    if (timeout) {
      clearTimeout(timeout.instance);
      timeout.reject(message.comment);

      this.timeoutsMap.delete(message.request_id);
    }
  }

  private messageToJson(message: WebSocket.RawData): Message | null {
    const asString = message.toString();

    try {
      const asJson = JSON.parse(asString);

      return asJson;
    } catch (error) {
      console.log(`Message ${asString} is not a valid json!`);

      return null;
    }
  }

  async send<T extends RequestCommands>(
    data: MessageBase<T>,
    timeoutMs = 10_000,
  ): Promise<ResponseByCommand<T>> {
    return new Promise<ResponseByCommand<T>>((resolve, reject) => {
      if (!this.client) {
        return reject('Please connect to websocket please!');
      }

      this.client.send(JSON.stringify(data));

      const timeout: TimeoutPromise<T> = {
        instance: setTimeout(() => {
          reject('Timeout exceeded');
        }, timeoutMs),
        reject,
        resolve,
      };

      this.timeoutsMap.set(data.request_id, timeout);
    })
  }

  close() {
    return this.client?.close();
  }
}