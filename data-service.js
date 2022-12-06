const Sequelize = require('sequelize');
var sequelize = new Sequelize('lwtygikc', 'lwtygikc', '8ui9wGJFJBrYwwJ69ULpsKkmdF_JujZU', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

sequelize.authenticate().then(() => console.log('Connection success.'))
    .catch((err) => console.log("Unable to connect to DB.", err));


var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,

});

var Department = sequelize.define('Department', {
    departmentID: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    departmentName: Sequelize.STRING,
});

//read files
module.exports.initialize = function () {

    return new Promise(function (resolve, reject) {

        sequelize.sync().then(function () {
            resolve();
        }).catch(function (error) {
            reject("unable to sync the database");
        });

    });

}

//get all employees
module.exports.getAllEmployees = function () {

    return new Promise(function (resolve, reject) {
       
        Employee.findAll()
        .then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("No results returned");
        });

    });

}

//get all managers
module.exports.getManagers = function () {

    return new Promise(function (resolve, reject) {
        reject();

    });

}

//get all departments
module.exports.getDepartments = function () {

    return new Promise(function (resolve, reject) {
        
        Department.findAll()
        .then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("No results returned");
        });

    });

}

//add employee to employees array
module.exports.addEmployee = function (employeeData) {

    return new Promise(function (resolve, reject) {

        employeeData.isManager = (employeeData.isManager) ? true : false;

        for(ed in employeeData){
            if(employeeData[ed] === ""){
                employeeData[ed] = null;
            }
        }

        Employee.create(employeeData)
        .then(function(){ 
            resolve();
        }).catch(function (error) {
            reject("Unable to create employee");
        });
    
    });

}

//get employees by status
module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        
        Employee.findAll({ where: {status: status}})
        .then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("No results returned");
        });

    });
}

//get employees by department
module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        
        Employee.findAll({ where: {department: department}})
        .then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("No results returned");
        });

    });
}

//get employees by manager
module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        
        Employee.findAll({ where: {employeeManagerNum: manager}})
        .then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("No results returned");
        });

    });
}

//get employee by employee num
module.exports.getEmployeesByNum = function (num) {
    return new Promise(function (resolve, reject) {
        
        Employee.findAll({ where: {employeeNum: num}})
        .then(function (data) {
            //console.log(data);
            resolve(data[0]);
        }).catch(function (error) {
            reject("No results returned");
        });

    });
}

//update employee
module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {

        employeeData.isManager = (employeeData.isManager) ? true : false;

        for(ed in employeeData){
            if(employeeData[ed] === ""){
                employeeData[ed] = null;
            }
        }

        Employee.update(employeeData, { where : {employeeNum : employeeData.employeeNum}})
        .then(function(){ 
            resolve();
        }).catch(function (error) {
            reject("Unable to update employee");
        });
        
    });
}


//--------------------------------------------------------

//add department
module.exports.addDepartment = function (departmentData) {

    return new Promise(function (resolve, reject) {

        for(ed in departmentData){
            if(departmentData[ed] === ""){
                departmentData[ed] = null;
            }
        }

        Department.create(departmentData)
        .then(function(){ 
            resolve();
        }).catch(function (error) {
            reject("Unable to create department");
        });
    
    });

}

//update department
module.exports.updateDepartment = function (departmentData) {

    return new Promise(function (resolve, reject) {

        for(ed in departmentData){
            if(departmentData[ed] === ""){
                departmentData[ed] = null;
            }
        }

        Department.update(departmentData, { where : {departmentID : departmentData.departmentID}} )
        .then(function(){ 
            resolve();
        }).catch(function (error) {
            reject("Unable to update department");
        });
    
    });

}

//get department by ID
module.exports.getDepartmentById = function (id) {

    return new Promise(function (resolve, reject) {

        Department.findAll({ where: {departmentID: id}})
        .then(function (data) {
            resolve(data[0]);
        }).catch(function (error) {
            reject("No results returned");
        });
    
    });

}

//delete employees by num
module.exports.deleteEmployeesByNum = function (empNum) {
    return new Promise(function (resolve, reject) {
        
        Employee.destroy({ where: {employeeNum: empNum}})
        .then(function (data) {
            resolve();
        }).catch(function (error) {
            reject("Unable to remove employee / Employee not found");
        });

    });
}