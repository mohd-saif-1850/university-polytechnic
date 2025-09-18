import mongoose, {Schema} from "mongoose";

const formSchema = new Schema({
    shop : {
        type : String,
        required : true
    },
    room : {
        type : Number,
        default : 0
    },
    item : {
        type : String,
        required : true
    },
    price : {
        type : String,
        required : true
    },
    isAvailable : {
        type : Boolean,
        required : true
    },
    message : {
        type : String,
        default : ''
    }
},{timestamps: true})

export const FormModel = mongoose.model("Form",formSchema)