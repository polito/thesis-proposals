module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define(
        'company', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(255),
            defaultValue: null
        }
    }, {
        tableName: 'company',
        timestamps: false
    });

    return Company;
}