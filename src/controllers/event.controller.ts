import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TypeEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeEvent;
      await eventDAO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "Success create an event");
    } catch (error) {
      response.error(res, error, "failed to create an event");
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeEvent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.category) query.category = filter.category;
        if (filter.isPublish) query.isPublish = filter.isPublish;
        if (filter.isOnline) query.isOnline = filter.isOnline;
        if (filter.isFeatured) query.isFeatured = filter.isFeatured;

        return query;
      };

      const {
        page = 1,
        limit = 10,
        search,
        category,
        isOnline,
        isPublish,
        isFeatured,
      } = req.query;

      const query = buildQuery({
        search,
        category,
        isOnline,
        isPublish,
        isFeatured,
      });

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await EventModel.find(query)
        .limit(+limit) // kasih + didepan untuk tandain kalau itu adalah integer
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean() // optimize hasil query
        .exec();

      const count = await EventModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
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

      const result = await EventModel.findOne({ slug });

      if (!result) return response.notFound(res, "event not found");
      response.success(res, result, "success find an event by slug");
    } catch (error) {
      response.error(res, error, "failed to find an event by slug");
    }
  },
};
