import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import { TicketDAO, TypeTicket } from "../models/ticket.model";
import TicketModel from "../models/ticket.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await TicketDAO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "success create a ticket");
    } catch (error) {
      response.error(res, error, "failed to create a ticket");
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TypeTicket> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await TicketModel.find(query)
        .populate("events") // supaya properti "events" berisi data yg lengkap. Karna ticket berelasi dengan event
        .limit(limit)
        .skip((page - 1) * 10)
        .sort({ createdAt: -1 })
        .exec();

      const count = await TicketModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          current: page,
          totalPages: Math.ceil(count / limit),
        },
        "success find all tickets"
      );
    } catch (error) {
      response.error(res, error, "failed to find all tickets");
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findById(id);

      if (!result) {
        return response.notFound(res, "Ticket not found");
      }

      response.success(res, result, "success find a ticket");
    } catch (error) {
      response.error(res, error, "failed to find a ticket");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "success update a ticket");
    } catch (error) {
      response.error(res, error, "failed to update a ticket");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "success remove a ticket");
    } catch (error) {
      response.error(res, error, "failed to remove a ticket");
    }
  },
  async findAllByEvent(req: IReqUser, res: Response) {
    try {
      const { eventId } = req.params;

      if (!isValidObjectId(eventId)) {
        return response.error(res, null, "tickets not found");
      }

      const result = await TicketModel.find({ events: eventId }).exec();
      response.success(res, result, "success found all tickets by an event");
    } catch (error) {
      response.error(res, error, "failed to find tickets by event");
    }
  },
};
