import express, {Request, Response} from 'express';
import {requireAuth} from '@dealtickets/common';
import {Order} from '../models/order';


const router = express.Router();

router.get('/api/routers', requireAuth, async(req: Request, res: Response) => {

    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket');

    res.send(orders);

});

export {router as indexOrderRouter};