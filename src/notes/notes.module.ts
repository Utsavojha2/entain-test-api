import { Module } from '@nestjs/common';
import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';
import { NotesGateway } from './notes.gateway';

@Module({
  imports: [InMemoryDBModule.forFeature('one', {}), InMemoryDBModule.forFeature('two', {})],
  providers: [NotesGateway]
})
export class NotesModule {}
