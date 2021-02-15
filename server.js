const Sequelize = require('sequelize');
const { DataTypes, UUID, UUIDV4 } = Sequelize;
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_db'
);
const express = require('express');
const app = express();

app.get('/api/departments', async (req, res, next) => {
  try {
    res.send(
      await Department.findAll({
        include: [
          {
            model: Employee,
            as: 'manager',
          },
        ],
      })
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/employees', async (req, res, next) => {
  try {
    res.send(
      await Employee.findAll({
        include: [],
      })
    );
  } catch (error) {
    next(error);
  }
});

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

Department.belongsTo(Employee, { as: 'manager' });
// to avoid the Department having both a managerId and an employeeId,
//when you do Employee.hasMany(Department), you must tell the association that
// managerId is the foreignKey, since the alias has been set up above.
Employee.hasMany(Department, { foreignKey: 'managerId' });

const syncAndSeed = async () => {
  await db.sync({ force: true });
  const [moe, lucy, hr, engineering] = await Promise.all([
    /*
    .create() combines .build() and .save(), so you don't need to write
    .save() below. In other words, .create() both creates a javaScript object
    that represents a table and then creates the actual table in the database
    that corresponds to that object
    */
    Employee.create({ name: 'moe' }),
    Employee.create({ name: 'lucy' }),
    Department.create({ name: 'hr' }),
    Department.create({ name: 'engineering' }),
  ]);

  //change the hr instance's managerId to lucy's id
  hr.managerId = lucy.id;
  //update the hr table with the hr instance's updated values
  await hr.save();
};

const init = async () => {
  try {
    await db.authenticate();
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
