import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@dealtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60 ;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    
    const existingOrder = await Order.findOne({
        ticket: ticket,
        status: {
          $in: [
            OrderStatus.Created,
            OrderStatus.AwaitingPayment,
            OrderStatus.Complete,
          ],
        },
      });


    if (existingOrder) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)


    // Build the order and save it to the database

    const BuildOrder = Order.build({

      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket
  });

    await BuildOrder.save();
    
    


    // Publish an event saying that an order was created

    res.status(201).send(BuildOrder);
  }
);

export { router as newOrderRouter };
