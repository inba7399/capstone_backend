const express = require("express")
const router = express.Router()
const User = require('../models/userModle')
const Doctor = require("../models/doctorModle")

router.get("/get-all-docotor", async (req, res) => {
    try {
        const requests = await Doctor.find({})
        res.send({ message: "all requests feched", success: true, data: requests })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

router.get("/get-all-users", async (req, res) => {
    try {
        const requests = await User.find({})
        res.send({ message: "all requests feched", success: true, data: requests })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

router.post("/change-doctor-status", async (req, res) => {
    try {
        const { doctorId, status, userId } = req.body
        const doctor = await Doctor.findByIdAndUpdate(doctorId, { status })
        const user = await User.findOne({ _id: userId })
        const unseenNotificatons = user.unseenNotificatons
        unseenNotificatons.push({
            type: "new-doctor-request-acepted",
            message: `${doctor.firstName} ${doctor.lastName} your doctor account has been ${status}`,
            onClickPath: '/notification'
        });
        user.isDoctor = status === 'approved' ? true : false
        await user.save()
        res.status(200).send({ message: "doctor account updated successfully", success: true, data: doctor })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})


module.exports = router