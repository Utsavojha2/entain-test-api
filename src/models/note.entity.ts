import { InMemoryDBEntity } from "@nestjs-addons/in-memory-db";

export interface NoteEntity extends InMemoryDBEntity {
  username: string;
  userId: string;
  text: string;
  timestamp: number;
}