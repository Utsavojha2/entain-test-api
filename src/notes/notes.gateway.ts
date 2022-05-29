import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsException } from '@nestjs/websockets';
import { InjectInMemoryDBService, InMemoryDBService } from '@nestjs-addons/in-memory-db';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { Server } from 'http';
import { WsGuard } from './notes.guard';
import { CreateNoteDto } from './dto/note.dto';
import { UserEntity } from 'src/models/user.entity';
import { NoteEntity } from 'src/models/note.entity';
import { ClientEntity } from 'src/models/client.entity';

@WebSocketGateway()
export class NotesGateway {
  @WebSocketServer() server: Server;

  constructor(
    @InjectInMemoryDBService('one') private userService: InMemoryDBService<UserEntity>,
    private readonly notesService: InMemoryDBService<NoteEntity>,
    @InjectInMemoryDBService('two') private clientService: InMemoryDBService<ClientEntity>,
  ) {
  }

  async handleConnection(client: Socket) {
    const user = await this.userService.get(client.handshake.headers.userid as string);
    if(!user){
      client._error({ message: 'Unauthorized' });
      client.disconnect();
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinBoard')
  async joinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody('name') name: string
  ) {
    const userId = client.handshake.headers.userid as string;
    const isUserAlreadyListed = this.clientService.getAll().find(client => client.userId === userId);
    if(isUserAlreadyListed) {
      return this.server.emit('boardUsers', this.clientService.getAll());
    }
    await this.clientService.create({ id: client.id , clientName: name, userId })
    const allOnlineUsers = this.clientService.getAll();
    this.server.emit('boardUsers', allOnlineUsers);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('createNote')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createNoteDto: CreateNoteDto
  ) {
    const message = { 
      ...createNoteDto, 
      userId: client.handshake.headers.userid as string,
      timestamp: Date.now()
    };
    this.server.emit('note', message);
    await this.notesService.create(message);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('findAllNotes')
  async findAll() {
    return this.notesService.getAll();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('removeNote')
  remove(@MessageBody() id: string) {
    return this.notesService.delete(id);
  }
}
