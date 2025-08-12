import mongoose, { Schema } from "mongoose";
import * as Yup from "yup";
import { EVENT_MODEL_NAME } from "./event.model";

export const TICKET_MODEL_NAME = "Ticket";

export const TicketDAO = Yup.object({
  price: Yup.number().required(),
  name: Yup.string().required(),
  events: Yup.string().required(),
  description: Yup.string().required(),
  quantity: Yup.number().required(),
});

export type TypeTicket = Yup.InferType<typeof TicketDAO>;

interface Ticket extends Omit<TypeTicket, "events"> {
  events: Schema.Types.ObjectId;
}

const TicketSchema = new Schema<Ticket>(
  {
    price: {
      type: Schema.Types.Number,
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    events: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: EVENT_MODEL_NAME, // referensi ke db model Event
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    quantity: {
      type: Schema.Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TicketModel = mongoose.model(TICKET_MODEL_NAME, TicketSchema);

export default TicketModel;
