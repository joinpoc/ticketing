import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import {TicketCreated} from './ticket-created-event';
import {Subjects} from './subject';

export class TicketCreatedListener extends Listener <TicketCreated> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreated['data'] , msg: Message) {
    console.log('Event data!', data);

    console.log(data.id);
    console.log(data.title);
    console.log(data.price);

    msg.ack();
  }
}
