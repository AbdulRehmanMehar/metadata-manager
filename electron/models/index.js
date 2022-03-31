const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class Workspace extends Model {}
  class Group extends Model {}
  class MetaData extends Model {}

  Workspace.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, { sequelize, modelName: 'Workspace' });

  Group.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, { sequelize, modelName: 'Group' });

  MetaData.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, { sequelize, modelName: 'MetaData' });


  Workspace.hasMany(Group, { as: 'groups' });
  Group.hasMany(MetaData, { as: 'data' });

  Group.belongsTo(Workspace, { foreignKey: 'WorkspaceId' })
  MetaData.belongsTo(Group, { foreignKey: 'GroupId' });


  return {
    Workspace,
    Group,
    MetaData
  };
}