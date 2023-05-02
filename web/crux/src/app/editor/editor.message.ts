import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'

export const WS_TYPE_EDITOR_JOINED = 'editor-joined'
export class EditorMessage {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @IsString()
  color: string

  @IsString()
  focusedItemId?: string

  @IsString()
  focusedInputId?: string
}

export const WS_TYPE_EDITOR_INIT = 'editor-init'
export class EditorInitMessage {
  @IsUUID()
  meId: string

  @ValidateNested()
  editors: EditorMessage[]
}

export const WS_TYPE_EDITOR_LEFT = 'editor-left'
export class EditorLeftMessage {
  @IsUUID()
  id: string

  @IsString()
  @IsOptional()
  focusedItemId?: string

  @IsString()
  @IsOptional()
  focusedInputId?: string
}

export const WS_TYPE_FOCUS_INPUT = 'focus-input'
export const WS_TYPE_BLUR_INPUT = 'blur-input'
export type InputFocusMessage = {
  itemId: string
  inputId: string
}

export const WS_TYPE_INPUT_FOCUSED = 'input-focused'
export const WS_TYPE_INPUT_BLURRED = 'input-blured'
export type InputFocusChangeMessage = InputFocusMessage & {
  userId: string
  itemId: string
}
