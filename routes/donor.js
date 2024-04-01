const express = require('express');
const router = express.Router();
const middleware = require('../middleware/index');
const User = require('../models/user');
const Donation = require('../models/donation');

router.get("/donor/dashboard", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const donorId = req.user._id;
        const TotalDonations = await Donation.countDocuments({ donor: donorId });
        const EWasteDonations = await Donation.countDocuments({ donor: donorId, wasteType:"ewaste" });
        const FoodDonations = await Donation.countDocuments({ donor: donorId, wasteType: "foodwaste" });
        const ClothsDonations = await Donation.countDocuments({ donor: donorId, wasteType: "clothwaste" });

        res.json({
            title: "Dashboard",
            TotalDonations,
            EWasteDonations,
            FoodDonations,
            ClothsDonations
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.post("/donor/donate", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const donation = req.body.donation;
        if (!donation) {
            res.status(400).json({ message: "Invalid request body: missing donation object" });
            return;
         }
        donation.status = 'pending';
        donation.donor = req.user._id;
        const newDonation = new Donation(donation);
        await newDonation.save();
        res.json({ message: "Donation request sent successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});

router.get("/donor/donations/pending", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const pendingDonations = await Donation.find({ donor: req.user._id, status: ["pending", "rejected", "accepted", "assigned"] }).populate("agent");
        res.json({ title: "Pending Donations", pendingDonations });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});
router.get("/donor/donations/foodwaste", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const pendingDonations = await Donation.find({ donor: req.user._id, wasteType:"foodwaste" }).populate("agent");
        res.json({ title: "FoodWaste", pendingDonations });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});
router.get("/donor/donations/ewaste", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const pendingDonations = await Donation.find({ donor: req.user._id, wasteType:"ewaste" }).populate("agent");
        res.json({ title: "EWaste", pendingDonations });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});
router.get("/donor/donations/clothwaste", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const pendingDonations = await Donation.find({ donor: req.user._id, wasteType:"clothwaste" }).populate("agent");
        res.json({ title: "ClothWaste", pendingDonations });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});

router.get("/donor/donations/previous", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const previousDonations = await Donation.find({ donor: req.user._id, status: "collected" }).populate("agent");
        res.json({ title: "Previous Donations", previousDonations });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});

router.delete("/donor/donation/deleteRejected/:donationId", async (req, res) => {
    try {
        const donationId = req.params.donationId;
        await Donation.findByIdAndDelete(donationId);
        res.json({ message: "Donation deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});

router.put("/donor/profile", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const id = req.user._id;
        const updateObj = req.body.donor; // updateObj: {firstName, lastName, gender, address, phone}
        await User.findByIdAndUpdate(id, updateObj);
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Some error occurred on the server.' });
    }
});

module.exports = router;
