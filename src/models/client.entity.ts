import { InMemoryDBEntity } from "@nestjs-addons/in-memory-db";

export interface ClientEntity extends InMemoryDBEntity {
    clientName: string;

    userId: string;
}