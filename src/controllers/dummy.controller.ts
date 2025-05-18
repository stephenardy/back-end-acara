import {Request, Response} from "express"; // ini tipe data, perlu dicantumkan karena pakai TypeScript

export default {
    dummy(req:Request, res:Response) {
        res.status(200).json({
            message: "Success hit endpoint /dummy",
            data: "OK"
        })
    }
}