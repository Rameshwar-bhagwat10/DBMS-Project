const { sendSuccess } = require("../utils/responseHandler");
const memberService = require("../services/memberService");

// Create a member.
async function createMember(req, res, next) {
	try {
		const member = await memberService.createMember(req.body);
		return sendSuccess(res, "Member created successfully", member);
	} catch (error) {
		return next(error);
	}
}

// Fetch all members.
async function getAllMembers(req, res, next) {
	try {
		const members = await memberService.getAllMembers();
		return sendSuccess(res, "Members fetched successfully", members);
	} catch (error) {
		return next(error);
	}
}

// Fetch one member by id.
async function getMemberById(req, res, next) {
	try {
		const member = await memberService.getMemberById(req.params.id);
		return sendSuccess(res, "Member fetched successfully", member);
	} catch (error) {
		return next(error);
	}
}

// Fetch borrowing history for one member.
async function getMemberHistory(req, res, next) {
	try {
		const history = await memberService.getMemberHistory(req.params.id);
		return sendSuccess(res, "Member history fetched successfully", history);
	} catch (error) {
		return next(error);
	}
}

// Update member details.
async function updateMember(req, res, next) {
	try {
		const member = await memberService.updateMember(req.params.id, req.body);
		return sendSuccess(res, "Member updated successfully", member);
	} catch (error) {
		return next(error);
	}
}

// Delete member with safety checks.
async function deleteMember(req, res, next) {
	try {
		const result = await memberService.deleteMember(req.params.id);
		return sendSuccess(res, "Member deleted successfully", result);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createMember,
	getAllMembers,
	getMemberById,
	getMemberHistory,
	updateMember,
	deleteMember,
};
