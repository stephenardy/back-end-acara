import mongoose from "mongoose";
import * as Yup from "yup";

const Schema = mongoose.Schema; //#1

//#2
//DAO = Data Access Object -> skema validasi
//DTO =
export const categoryDTO = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  icon: Yup.string().required(),
});

export type Category = Yup.InferType<typeof categoryDTO>; //#3

//#4
const CategorySchema = new Schema<Category>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    icon: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const categoryModel = mongoose.model("Category", CategorySchema); //#5

export default categoryModel; //#6
