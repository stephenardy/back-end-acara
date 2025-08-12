import mongoose, { ObjectId, Schema } from "mongoose";
import * as Yup from "yup";

export const BANNER_MODEL_NAME = "Banner";

export const BannerDAO = Yup.object({
  title: Yup.string().required(),
  image: Yup.string().required(),
  isShow: Yup.boolean().required(),
});

export type TypeBanner = Yup.InferType<typeof BannerDAO>;

interface Banner extends TypeBanner {}

const BannerSchema = new Schema<Banner>(
  {
    title: {
      type: Schema.Types.String,
      required: true,
    },
    image: {
      type: Schema.Types.String,
      required: true,
    },
    isShow: {
      type: Schema.Types.Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BannerModel = mongoose.model(BANNER_MODEL_NAME, BannerSchema);

export default BannerModel;
