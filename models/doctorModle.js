const mongoose = require('mongoose')
const doctorSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true },
        about: { type: String, required: true },
        specialization: { type: String, required: true },
        experience: { type: String, required: true },
        price: { type: Number, required: true },
        status:{type:String,default:"Pending" },
        timings:{type:Array,required:true}
    },
    {
        timestamps: true
    }
)

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel