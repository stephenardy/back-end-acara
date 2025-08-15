import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import OrderModel, {
  orderDAO,
  OrderStatus,
  TypeOrder,
  TypeVoucher,
} from "../models/order.model";
import TicketModel from "../models/ticket.model";
import { FilterQuery } from "mongoose";
import { getId } from "../utils/id";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const payload = {
        ...req.body,
        createdBy: userId,
      } as TypeOrder;

      await orderDAO.validate(payload);

      // cek tiket dan quantity nya
      const ticket = await TicketModel.findById(payload.ticket);
      if (!ticket) return response.notFound(res, "ticket not found");

      if (ticket.quantity > payload.quantity) {
        return response.error(res, null, "ticket quantity is not enough");
      }

      const total: number = +ticket?.price * +payload.quantity;

      // gabungin total ke dalam payload
      Object.assign(payload, {
        ...payload,
        total,
      });

      const result = await OrderModel.create(payload);
      response.success(res, result, "success create order");
    } catch (error) {
      response.error(res, error, "failed to create an order");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeOrder> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { page = 1, limit = 10, search } = req.query;

      const query = buildQuery({
        search,
      });

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await OrderModel.find(query)
        .limit(+limit) // kasih + didepan untuk tandain kalau itu adalah integer
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean() // optimize hasil query
        .exec();

      const count = await OrderModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        "success find all orders"
      );
    } catch (error) {
      response.error(res, error, "failed to find all orders");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await OrderModel.findOne({ orderId });
      if (!result) return response.notFound(res, "order not found");
      response.success(res, result, "success find an order");
    } catch (error) {
      response.error(res, error, "failed to find an order");
    }
  },
  async findAllByMember(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "failed to find member orders");
    }
  },

  async complete(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      // Cek order dan statusnya
      const order = await OrderModel.findOne({
        orderId,
        createdBy: userId,
      });
      if (!order) return response.notFound(res, "order not found");
      if (order.status === OrderStatus.COMPLETED)
        return response.error(res, null, "you have been completed this order");

      // Generate Voucher
      const vouchers: TypeVoucher[] = Array.from(
        { length: order.quantity },
        () => {
          return {
            voucherId: getId(),
            isPrint: false,
          } as TypeVoucher;
        }
      );

      // Update Voucher
      const result = await OrderModel.findOneAndUpdate(
        // berdasarkan ini
        {
          orderId,
          createdBy: userId,
        },
        // update ini
        {
          vouchers,
          status: OrderStatus.COMPLETED,
        },
        // give you the object after update was applied
        {
          new: true,
        }
      );

      // Update ticket quantity
      const ticket = await TicketModel.findById(order.ticket);
      if (!ticket) return response.notFound(res, "ticket and order not found");

      await TicketModel.updateOne(
        {
          _id: ticket._id,
        },
        {
          quantity: ticket.quantity - order.quantity,
        }
      );

      response.success(res, result, "success to complete an order");
    } catch (error) {
      response.error(res, error, "failed to complete an order");
    }
  },
  async pending(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "failed to pending an order");
    }
  },
  async cancelled(req: IReqUser, res: Response) {
    try {
    } catch (error) {
      response.error(res, error, "failed to cancel an order");
    }
  },
};
