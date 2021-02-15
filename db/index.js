const Sequelize = require('sequelize');
const { DataTypes, UUID, UUIDV4 } = Sequelize;
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_db'
);

const Department = db.define('department', {
  name: {
    type: DataTypes.STRING(20),
  },
});
const Employee = db.define('employee', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: DataTypes.STRING(20),
  },
});

// to avoid the Department having both a managerId and an employeeId,
//when you do Employee.hasMany(Department), you must tell the association that
// managerId is the foreignKey, since the alias has been set up above.
Department.belongsTo(Employee, { as: 'manager' });
Employee.hasMany(Department, { foreignKey: 'managerId' });

Employee.belongsTo(Employee, { as: 'supervisor' });
Employee.hasMany(Employee, { foreignKey: 'supervisorId' });

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [moe, lucy, larry, hr, engineering] = await Promise.all([
    /*
    .create() combines .build() and .save(), so you don't need to write
    .save() below. In other words, .create() both creates a javaScript object
    that represents a table and then creates the actual table in the database
    that corresponds to that object
    */
    Employee.create({ name: 'moe' }),
    Employee.create({ name: 'lucy' }),
    Employee.create({ name: 'larry' }),
    Department.create({ name: 'hr' }),
    Department.create({ name: 'engineering' }),
  ]);

  //change the hr instance's managerId to lucy's id
  hr.managerId = lucy.id;
  //update the hr table with the hr instance's updated values
  await hr.save();
  moe.supervisorId = lucy.id;
  larry.supervisorId = lucy.id;
  await Promise.all([moe.save(), larry.save()]);
};

module.exports = { syncAndSeed, db, models: { Department, Employee } };
