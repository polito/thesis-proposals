module.exports = (sequelize, DataTypes) => {
    const ThesisApplicationSupervisor = sequelize.define('ThesisApplicationSupervisor', {
        thesis_application_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
            // Foreign key gestita in index.js
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
            // Foreign key gestita in index.js
        },
        is_supervisor: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // false = cosupervisor, true = supervisor
        }
    }, {
        tableName: 'thesis_application_supervisor',
        timestamps: false
    });

    return ThesisApplicationSupervisor;
};