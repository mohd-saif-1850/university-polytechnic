import mongoose, {Schema} from "mongoose";

const consumedSchema = new Schema({
    id : {
        type : Schema.Types.ObjectId,
        ref : 'ItemModel'
    },
    consumed : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    }
},{timestamps: true})

export const ConsumedModel = mongoose.model("Consumed",consumedSchema)