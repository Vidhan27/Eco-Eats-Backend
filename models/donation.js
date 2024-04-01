    const mongoose = require('mongoose');

    const donationSchema = new mongoose.Schema({
        donor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"EcoEats",
        },
        agent:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"EcoEats",
        },
        wasteType:{
            type:String,
            enum:['ewaste','foodwaste','clothwaste'],
            default:'ewaste',
        }, 
        quantity:{
            type:String,
        },
        address:{
            type:String,
        },
        phone:{
            type:Number,
        },
        donorToAgentMsg:String,
        agentToDonorMsg:String,
        collectionTime:{
            type:Date,
        },
        status:{
            type:String,
            enum:['pending','accepted','rejected','collected'],
            default:'pending',
        }
    })

    const Donation = mongoose.model('Donation',donationSchema);
    module.exports = Donation;