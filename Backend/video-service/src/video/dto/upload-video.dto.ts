import { IsIn, IsOptional } from 'class-validator';

export class UploadVideoDto {
  // Multipart form field alongside the file. Set to 'MOOD_BOARD' when the
  // upload is a mood-board image (DirectorStudioScreen) rather than an
  // actual video, so the service can skip the "New video uploaded" feed post.
  @IsOptional()
  @IsIn(['MOOD_BOARD'])
  kind?: 'MOOD_BOARD';
}
