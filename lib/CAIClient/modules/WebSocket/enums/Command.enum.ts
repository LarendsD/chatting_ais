enum Command {
  UpdateTurn = 'update_turn',
  AddTurn = 'add_turn',
  NeoError = 'neo_error',
  GenerateTurn = 'generate_turn_candidate',
  CreateAndGenerateTurn = 'create_and_generate_turn',

  EditTurn = 'edit_turn_candidate',
  UpdatePrimary = 'update_primary_candidate',

  CreateChat = 'create_chat',
  CreateChatResponse = 'create_chat_response',

  Ok = 'ok'
}

export default Command;
