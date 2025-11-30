import Command from '../enums/Command.enum.js';
import AddTurnCommand from './commands/AddTurnCommand.type.js';
import CreateAndGenerateTurnCommand from './commands/CreateAndGenerateCommand.type.js';
import CreateChatCommand from './commands/CreateChatCommand.type.js';
import CreateChatResponseCommand from './commands/CreateChatResponseCommand.type.js';
import EditTurnCandidateCommand from './commands/EditTurnCandidateCommand.type.js';
import GenerateTurnCommand from './commands/GenerateTurnCommand.type.js';
import NeoErrorCommand from './commands/NeoErrorCommand.type.js';
import UpdatePrimaryCandidateCommand from './commands/UpdatePrimaryCandidateCommand.type.js';
import UpdateTurnCommand, { UpdateTurnFinal } from './commands/UpdateTurnCommand.type.js';

type MessageAdditionalInfo<T> =
  T extends Command.AddTurn ? AddTurnCommand :
  T extends Command.UpdateTurn ? UpdateTurnCommand :
  T extends Command.NeoError ? NeoErrorCommand :
  T extends Command.CreateAndGenerateTurn ? CreateAndGenerateTurnCommand :
  T extends Command.GenerateTurn ? GenerateTurnCommand :
  T extends Command.EditTurn ? EditTurnCandidateCommand :
  T extends Command.UpdatePrimary ? UpdatePrimaryCandidateCommand :
  T extends Command.CreateChat ? CreateChatCommand :
  T extends Command.CreateChatResponse ? CreateChatResponseCommand : unknown;


export type MessageBase<T> = {
  command: T;
  request_id: string;
} & MessageAdditionalInfo<T>

export type ResponseByCommand<T> =
  T extends Command.CreateAndGenerateTurn | Command.GenerateTurn | Command.EditTurn ? UpdateTurnFinal :
  T extends Command.CreateChat ? CreateChatResponseCommand :
  T extends Command.UpdatePrimary ? null :
  never;

type Message =
  | MessageBase<Command.AddTurn>
  | MessageBase<Command.UpdateTurn>
  | MessageBase<Command.NeoError>
  | MessageBase<Command.CreateAndGenerateTurn>
  | MessageBase<Command.GenerateTurn>
  | MessageBase<Command.EditTurn>
  | MessageBase<Command.UpdatePrimary>
  | MessageBase<Command.CreateChat>
  | MessageBase<Command.CreateChatResponse>
  | MessageBase<Command.Ok>;

export default Message;
