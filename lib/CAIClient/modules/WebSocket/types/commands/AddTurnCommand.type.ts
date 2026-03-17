import ChatType from '../../enums/ChatType.enum.js'
import GenerationMode from '../../enums/GenerationMode.enum.js'
import TurnState from '../../enums/TurnState.enum.js'

type AddTurnCommandBase<T extends boolean> = {
  turn: {
    turn_key: {
      chat_id: string,
      turn_id: string
    },
    state: TurnState,
    author: {
      author_id: string,
      is_human: T,
      name: string
    },
    candidates: [
      {
        candidate_id: string,
        raw_content: string,
      } & (T extends true ? {
        create_time: string,
        is_final: boolean
      } : {
        model_type: string,
      })
    ],
    primary_candidate_id: string
  } & (T extends true ? {
    create_time: string;
    last_update_time: string;
  } : Record<string, never>),
  chat_info: {
    type: ChatType;
  },
} & (T extends false ? {
  generation_mode: {
    mode: GenerationMode,
    remaining_quota_frac: number
  }
} : Record<string, never>)

export type AddTurnHuman = AddTurnCommandBase<true>;
type AddTurnBot   = AddTurnCommandBase<false>;
type AddTurnCommand   = AddTurnHuman | AddTurnBot;

export default AddTurnCommand;
