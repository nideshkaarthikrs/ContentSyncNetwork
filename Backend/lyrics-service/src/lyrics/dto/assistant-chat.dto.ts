import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssistantChatDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsArray()
  @IsOptional()
  history?: { role: string; content: string }[];
}
