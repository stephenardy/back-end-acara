import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import BannerModel, { bannerDTO, TypeBanner } from "../models/banner.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await bannerDTO.validate(req.body);
      const result = await BannerModel.create(req.body);
      response.success(res, result, "success create a banner");
    } catch (error) {
      response.error(res, error, "failed create a banner");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const { page = 1, limit = 10, search, isShow } = req.query;

      const buildQuery = (filter: any) => {
        const query: FilterQuery<TypeBanner> = {};

        if (filter.search) {
          query.$text = { $search: filter.search };
        }

        if (filter.isShow === "true") {
          query.isShow = true;
        }

        return query;
      };

      const query = buildQuery({ search, isShow });

      const result = await BannerModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await BannerModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          current: +page,
          totalPages: Math.ceil(count / +limit),
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

      if (!isValidObjectId(id)) {
        return response.notFound(res, "banner not found");
      }

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

      if (!isValidObjectId(id)) {
        return response.notFound(res, "banner not found");
      }

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

      if (!isValidObjectId(id)) {
        return response.notFound(res, "banner not found");
      }

      const result = await BannerModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "success remove a banner");
    } catch (error) {
      response.error(res, error, "failed remove a banner");
    }
  },
};
