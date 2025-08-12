import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TEvent;
      await eventDAO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "Success create an event");
    } catch (error) {
      response.error(res, error, "failed to create an event");
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TEvent> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await EventModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await EventModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: page,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        "success find all events"
      );
    } catch (error) {
      response.error(res, error, "failed to find all events");
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "event not found");
      }

      const result = await EventModel.findById(id);

      if (!result) {
        return response.notFound(res, "Event not found");
      }

      response.success(res, result, "success find an event");
    } catch (error) {
      response.error(res, error, "failed to find an event");
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "event not found");
      }

      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true, // supaya data langsung berubah setelah di update
      });
      response.success(res, result, "success update an event");
    } catch (error) {
      response.error(res, error, "failed to update an event");
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "event not found");
      }

      const result = await EventModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "success remove an event");
    } catch (error) {
      response.error(res, error, "failed to remove an event");
    }
  },

  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;

      if (!isValidObjectId(slug)) {
        return response.notFound(res, "event not found");
      }

      const result = await EventModel.findOne({ slug });
      response.success(res, result, "success find an event by slug");
    } catch (error) {
      response.error(res, error, "failed to find an event by slug");
    }
  },
};
