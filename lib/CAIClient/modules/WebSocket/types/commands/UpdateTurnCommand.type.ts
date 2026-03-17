import ChatType from '../../enums/ChatType.enum.js';
import GenerationMode from '../../enums/GenerationMode.enum.js';
import TurnState from '../../enums/TurnState.enum.js';

type UpdateTurnCommandBase<T extends boolean> = {
  turn: {
    turn_key: {
      chat_id: string;
      turn_id: string;
    },
    state: TurnState;
    author: {
      author_id: string;
      name: string;
      is_human?: boolean;
    },
    candidates: [
      {
        candidate_id: string;
        raw_content: string;
        model_type: string;
      } & (T extends true ? {
        create_time: string;
        is_final: T;
      } : Record<string, never>)
    ];
    primary_candidate_id: string;
  } & (T extends true ? {
    create_time: string;
    last_update_time: string;
  } : Record<string, never>);
  chat_info: {
    type: ChatType;
  };
  generation_mode: {
    mode: GenerationMode;
    remaining_quota_frac: number;
  },
}

export type UpdateTurnFinal = UpdateTurnCommandBase<true>;
type UpdateTurnProcessing   = UpdateTurnCommandBase<false>;
type UpdateTurnCommand   = UpdateTurnFinal | UpdateTurnProcessing;

export default UpdateTurnCommand;
