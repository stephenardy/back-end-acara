import { version } from "mongoose";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v0.0.1",
    title: "Dokumentasi API Acara",
    description: "Dokumentasi Backend Acara",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
    {
      url: "https://back-end-acara-navy.vercel.app/api",
      description: "Deploy Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "ardystephen",
        password: "12341234",
      },
      RegistrationRequest: {
        fullName: "joni joni",
        username: "joni2025",
        email: "joni.jon@yopmail.com",
        password: "12345678",
        confirmPassword: "12345678",
      },
      ActivationRequest: {
        code: "abcdefg",
      },
      UpdateProfileRequest: {
        fullName: "new name",
        profilePicture: "profile picture url",
      },
      UpdatePasswordRequest: {
        oldPassword: "",
        password: "",
        confirmPassword: "",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name: "",
        startDate: "yyyy-mm-dd hh:mm:ss",
        endDate: "yyyy-mm-dd hh:mm:ss",
        description: "",
        banner: "fileUrl",
        category: "category ObjectID",
        location: {
          region: "region id",
          coordinates: [0, 0],
          address: "",
        },
        isOnline: false,
        isFeatured: false,
        isPublish: false,
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
      CreateBannerRequest: {
        title: "Banner title",
        image:
          "https://res.cloudinary.com/drjndjjo0/image/upload/v1754970915/xanhf4vvzetrhlhqppfj.jpg",
        isShow: false,
      },
      CreateTicketRequest: {
        price: 12000,
        name: "ticket title",
        events: "eventId",
        description: "ticket description",
        quantity: 120,
      },
      CreateOrderRequest: {
        events: "event id",
        ticket: "ticket id",
        quantity: 1,
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
