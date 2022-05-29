import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    text: string;
}
