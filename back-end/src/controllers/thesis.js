
const { QueryTypes } = require('sequelize');
const {
    sequelize,
    Thesis
} = require('../models');
const thesisSchema = require('../schemas/Thesis');

// ==========================================
// CONTROLLERS
// ==========================================
const getLoggedStudentThesis = async (req, res) => {
    try {
        const loggedStudent = await sequelize.query(
            `
            SELECT 
              s.*
            FROM student s
            INNER JOIN logged_student ls ON s.id = ls.student_id
            LIMIT 1
            `,
            { type: QueryTypes.SELECT },
        );

        const thesisData = await Thesis.findOne({
            where: {
                student_id: loggedStudent[0].id,
            },
        });

        if (!thesisData) {
            return res.status(404).json({ message: 'Thesis not found for the logged-in student.' });
        }

        const thesisResponse = thesisSchema.parse(thesisData.toJSON());
        return res.status(200).json(thesisResponse);
    } catch (error) {
        console.error('Error fetching student thesis:', error);
        console.error(error?.stack);
        return res.status(500).json({ error: 'An error occurred while fetching the thesis.' });
    }
};

module.exports = {
    getLoggedStudentThesis,
};


