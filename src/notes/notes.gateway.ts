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

  async handleDisconnect(client: Socket){
    await this.clientService.delete(client.id);
    const newClientsList = await this.clientService.getAll();
    this.server.emit('boardUsers', newClientsList);
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
    if(!createNoteDto.text) return;
    const message = { 
      ...createNoteDto, 
      userId: client.handshake.headers.userid as string,
      timestamp: Date.now()
    };
    const createdMessage = await this.notesService.create(message);
    this.server.emit('note', {
      notesPayload: createdMessage,
      isMutated: false
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('findAllNotes')
  async findAll() {
    return this.notesService.getAll();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('removeNote')
  async remove(@MessageBody() id: string) {
    await this.notesService.delete(id);
    const whiteboardNotes = await this.notesService.getAll();
    this.server.emit('note', {
      notesPayload: whiteboardNotes,
      isMutated: true
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('reorderNotes')
  async reorderNoteList(
    @ConnectedSocket() client: Socket,
    @MessageBody() indexes: Record<string, number>
  ) {
    const { startIndex, endIndex } = indexes;
    const whiteboardNotes = await this.notesService.getAll()
    const reorderRequestNotes = whiteboardNotes.filter((_el, idx) => (
      idx === startIndex || idx === endIndex
    ))
    const doesBelongToCurrentUser = reorderRequestNotes.every((note) => note.userId === client.handshake.headers.userid as string);
    if(!doesBelongToCurrentUser){
      throw new WsException('You are not authorized to reorder notes');
    }
    const appNotesList = [...whiteboardNotes];
    const dragItemContent = appNotesList[startIndex];
    appNotesList.splice(startIndex, 1);
    appNotesList.splice(endIndex, 0, dragItemContent);
    whiteboardNotes.forEach(async(note) => {
      await this.notesService.delete(note.id);
    });
    await this.notesService.createMany(appNotesList);
    const newNotesList = await this.notesService.getAll();
    this.server.emit('note', {
      notesPayload: newNotesList,
      isMutated: true
    });
  } 

  @UseGuards(WsGuard)
  @SubscribeMessage('updateNote')
  async updateNodeItem(@MessageBody() note: NoteEntity) {
    await this.notesService.update(note);
    const updatedNotesList = await this.notesService.getAll();
    this.server.emit('note', {
      notesPayload: updatedNotesList,
      isUpdated: true
    });
  }
}
