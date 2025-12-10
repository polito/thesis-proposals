module.exports = (sequelize, DataTypes) => {
    const ThesisApplication = sequelize.define('ThesisApplication', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        student_id: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        thesis_proposal_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        topic: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        submission_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM("pending", "rejected", "accepted", "canceled", "conclusion_requested", "conclusion_accepted", "done"),
            allowNull: false,
            defaultValue: "pending"
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_embargo: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        request_conclusion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        conclusion_confirmation: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'thesis_application',
        timestamps: false
    });

    return ThesisApplication;
};