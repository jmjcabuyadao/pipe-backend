module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('org_tree', {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nodeOne: {
            field: 'node_one',
            type: DataTypes.STRING,
        },
        nodeTwo: {
            field: 'node_two', 
            type: DataTypes.STRING 
        },
        branchType: {
            field: 'branch_type', 
            type: DataTypes.ENUM,
            values: ['parent', 'daughter', 'sister'] 
        }
      },
      {
          timestamps: false,
          freezeTableName: true,
      }
    );
}