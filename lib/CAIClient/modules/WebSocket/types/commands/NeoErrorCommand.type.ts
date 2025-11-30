interface NeoErrorCommand {
  comment: string;
  error_code: number;
  sub_code: number | null;
  retry_after_seconds: boolean | null;
}

export default NeoErrorCommand;
