const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");

router.get("/agent/dashboard", middleware.ensureAgentLoggedIn, async (req,res) => {
	const agentId = req.user._id;
	const numDonors = await User.countDocuments({ role: "donor" });
	const TotalDonations = await Donation.countDocuments({ status:['pending','accepted','collected'] });
	const EWasteDonations = await Donation.countDocuments({  wasteType:"ewaste" });
	const FoodDonations = await Donation.countDocuments({  wasteType: "foodwaste" });
	const ClothsDonations = await Donation.countDocuments({  wasteType: "clothwaste" });
	res.json({
		title: "Dashboard",
		 TotalDonations , numDonors , EWasteDonations, FoodDonations, ClothsDonations
	});
});

router.get("/agent/donations/pending", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({  status:[ "pending"] }).populate("donor");
		res.json({ title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});
router.get("/agent/donations/accepted", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const acceptedCollections = await Donation.find({  status:[ "accepted"] }).populate("donor");
		res.json({ title: "Accepted Collections", acceptedCollections });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});
router.get("/agent/donations/rejected", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const rejectedCollections = await Donation.find({  status:[ "rejected"] }).populate("donor");
		res.json({ title: "Rejected", rejectedCollections });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});

router.get("/agent/donations/previous", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ status: "collected" }).populate("donor");
		res.json({ title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});

router.get("/agent/donations/view/:donationId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("donor");
		res.json({ title: "Collection details", donation });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});

router.get("/agent/donations/collect/:donationId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.donationId;
		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		res.json({ message: "Donation collected successfully" });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});

router.get("/agent/donation/accept/:donationId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "accepted" });
		req.flash("success", "Donation accepted successfully");
		res.json({message:`/admin/donation/view/${donationId}`});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/agent/profile", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const agentProfile = await User.findById(req.user._id);
		res.json({ title: "My Profile", agentProfile });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});
router.get("/agent/donation/reject/:donationId", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "rejected" });
		res.json(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.put("/agent/profile", middleware.ensureAgentLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.agent;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		res.json({ message: "Profile updated successfully" });
	}
	catch(err)
	{
		console.log(err);
		res.status(500).json({ message: 'Some error occurred on the server.' });
	}
});

module.exports = router;
