import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import BannerModel, { BannerDAO, TypeBanner } from "../models/banner.model";
import { FilterQuery } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await BannerDAO.validate(req.body);
      const result = await BannerModel.create(req.body);
      response.success(res, result, "success create a banner");
    } catch (error) {
      response.error(res, error, "failed create a banner");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TypeBanner> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await BannerModel.find(query)
        .limit(limit)
        .skip((page - 1) * 10)
        .sort({ createdAt: -1 })
        .exec();

      const count = await BannerModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          current: page,
          totalPages: Math.ceil(count / limit),
        },
        "success find all banners"
      );
    } catch (error) {
      response.error(res, error, "failed find all banners");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await BannerModel.findById(id);

      if (!result) {
        return response.notFound(res, "Banner not found");
      }

      response.success(res, result, "success find a banner");
    } catch (error) {
      response.error(res, error, "failed find a banner");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await BannerModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "success update a banner");
    } catch (error) {
      response.error(res, error, "failed update a banner");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await BannerModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "success remove a banner");
    } catch (error) {
      response.error(res, error, "failed remove a banner");
    }
  },
};
