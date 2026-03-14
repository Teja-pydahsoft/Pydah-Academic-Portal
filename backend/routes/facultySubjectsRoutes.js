const express = require('express');
const router = express.Router();
const facultySubjectsController = require('../controllers/facultySubjectsController');

// GET all assigned faculties for a given subject (and optionally batch)
router.get('/', facultySubjectsController.getAssignedFaculty);

// POST map an employee to a subject
router.post('/', facultySubjectsController.assignFaculty);

// DELETE unassign an employee from a subject
router.delete('/:id', facultySubjectsController.unassignFaculty);

module.exports = router;
