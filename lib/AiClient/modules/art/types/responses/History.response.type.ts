import { Workflow } from '../workflow/Workflow.type.js';

export type HistoryResponse = {
  [key in string]?: {
    prompt?: [
      number,
      string,
      Workflow,
      {
        create_time: number;
      },
      number[],
    ];
    outputs?: {
      [key in number]?: {
        images?: Array<{
          filename: string;
          subfolder: string;
          type: 'output';
        }>;
      }
    };
    status?: {
      status_str: 'queued' | 'running' | 'completed' | 'error';
      completed: boolean;
      messages: Array<
        [string, object]
      >;
    };
    meta?: {
      [key in number]: {
        node_id: string;
        display_node: string;
        parent_node: string | null;
        real_node_id: string;
      }
    };
  }
};
