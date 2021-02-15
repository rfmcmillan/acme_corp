const {
  syncAndSeed,
  db,
  models: { Department, Employee },
} = require('./db');
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
        include: [
          {
            model: Employee,
            as: 'supervisor',
          },
          Employee,
          Department,
        ],
      })
    );
  } catch (error) {
    next(error);
  }
});

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
