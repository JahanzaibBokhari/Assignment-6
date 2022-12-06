/*************************************************************************
* BTI325– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic 
Policy. No part * of this assignment has been copied manually or electronically from any 
other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Jahanzaib Bokhari, Student ID: 101633204, Date: 2022-11-27
*
* Your app’s URL (from Cyclic) : https://sore-lime-cougar-wig.cyclic.app
*
*************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var fs = require('fs');
const multer = require("multer");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    navLink: function (url, options) {
      return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set('view engine', '.hbs');

const storage = multer.diskStorage({
  destination: "./public/images/uploaded/",
  filename: function (req, file, cb) {

    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

var path = require("path");

//require the data-service module
var data_service = require("./data-service.js");

//require data service auth module
var dataServiceAuth = require("./data-service-auth.js");

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "assignment_6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// setup a 'route' to listen on the default url path
app.get("/", function (req, res) {
  res.render("home");
});

// setup a 'route' to listen on the /about url path
app.get("/about", function (req, res) {
  res.render("about");
});

// setup a 'route' to listen on the /employees/add url path
app.get("/employees/add", ensureLogin, function (req, res) {

  data_service.getDepartments()
    .then(function (data) {
      res.render("addEmployee", { departments: data });
    })
    .catch(function (reason) {
      res.render("addEmployee", { departments: [] });
    });

});

// setup a 'route' to listen on the /images/add url path
app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});

// setup a 'route' to listen on the /employees url path
app.get("/employees", ensureLogin, function (req, res) {

  if (req.query.status) {
    data_service.getEmployeesByStatus(req.query.status)
      .then(function (data) {
        if (data.length > 0)
          res.render("employees", { employees: data });
        else
          res.render("employees", { message: "no results" });
      })
      .catch(function (reason) {
        var message = { "message": reason };
        res.render("employees", message);
      });
  }
  else if (req.query.department) {
    data_service.getEmployeesByDepartment(req.query.department)
      .then(function (data) {
        if (data.length > 0)
          res.render("employees", { employees: data });
        else
          res.render("employees", { message: "no results" });
      })
      .catch(function (reason) {
        var message = { "message": reason };
        res.render("employees", message);
      });
  }
  else if (req.query.manager) {
    data_service.getEmployeesByManager(req.query.manager)
      .then(function (data) {
        if (data.length > 0)
          res.render("employees", { employees: data });
        else
          res.render("employees", { message: "no results" });
      })
      .catch(function (reason) {
        var message = { "message": reason };
        res.render("employees", message);
      });
  }
  else {
    data_service.getAllEmployees()
      .then(function (data) {
        if (data.length > 0) {
          //console.log(data);
          res.render("employees", { employees: data });
        }
        else
          res.render("employees", { message: "no results" });
      })
      .catch(function (reason) {
        var message = { "message": reason };
        res.render("employees", message);
      });
  }

});

//setup a route for Employee/value
app.get("/employee/:employeeNum", ensureLogin, function (req, res) {

  // initialize an empty object to store the values
  let viewData = {};
  data_service.getEmployeesByNum(req.params.employeeNum).then((data) => {
    if (data) {
      viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
      viewData.employee = null; // set employee to null if none were returned
    }
  }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error 
  }).then(data_service.getDepartments)
    .then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentID that matches
      // the employee's "department" value, add a "selected" property to the matching 
      // viewData.departments object

      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentID == viewData.employee.department) {
          viewData.departments[i].selected = true;
        }
      }
    }).catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
      if (viewData.employee == null) { // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        //console.log(viewData)
        res.render("employee", { viewData: viewData });
      }
    });

});

//delete employee by num

app.get("/employees/delete/:employeeNum", ensureLogin, function (req, res) {

  data_service.deleteEmployeesByNum(req.params.employeeNum)
    .then(function () {
      res.redirect("/employees");
    }).catch(function (error) {
      res.status(500).send(error);
    });

});

// setup a 'route' to listen on the /departments url path
app.get("/departments", ensureLogin, function (req, res) {

  data_service.getDepartments()
    .then(function (data) {
      if (data.length > 0)
        res.render("departments", { departments: data });
      else
        res.render("departments", { message: "no results" });
    })
    .catch(function (reason) {
      var message = { "message": reason };
      res.render("departments", message);
    });

});

app.get("/images", ensureLogin, function (req, res) {

  const readDirectory = new Promise((resolve, reject) => {

    fs.readdir("./public/images/uploaded", function (err, items) {
      if (err)
        reject(err);
      else {
        var allImages = { "images": [] };

        items.forEach(file => {
          allImages.images.push(file);
        })
        resolve(allImages)
      }
    });
  });

  readDirectory
    .then(function (data) {
      //res.json(data);
      res.render("images", { data: data });
    })
    .catch(function (reason) {
      res.json(reason);
    });

});

//add image
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

//add employee
app.post("/employees/add", ensureLogin, (req, res) => {

  data_service.addEmployee(req.body)
    .then(function (data) {
      res.redirect("/employees");
    })
    .catch(function (reason) {
      res.status(500).send(reason);
    });

});

//update employee
app.post("/employee/update", ensureLogin, (req, res) => {
  //console.log(req.body);

  data_service.updateEmployee(req.body)
    .then(function (data) {
      res.redirect("/employees");
    })
    .catch(function (reason) {
      res.status(500).send(reason);
    });

});

//------------------ Department routes --------------------------

// setup a 'route' to listen on the /departments/add url path
app.get("/departments/add", ensureLogin, function (req, res) {
  res.render("addDepartment");
});

//add department
app.post("/departments/add", ensureLogin, (req, res) => {

  data_service.addDepartment(req.body)
    .then(function (data) {
      res.redirect("/departments");
    })
    .catch(function (reason) {
      res.status(404).send(reason);
    });

});

//update department
app.post("/department/update", ensureLogin, (req, res) => {

  data_service.updateDepartment(req.body)
    .then(function (data) {
      res.redirect("/departments");
    })
    .catch(function (reason) {
      res.status(404).send(reason);
    });

});

//setup a route for Department/value
app.get("/department/:departmentID", ensureLogin, function (req, res) {

  data_service.getDepartmentById(req.params.departmentID)
    .then(function (data) {
      if (typeof data === "undefined") {
        res.status(404).send("Department Not Found");
      }
      else {
        res.render("department", { department: data });
      }
    })
    .catch(function (reason) {
      res.status(404).send("Department Not Found");
    });

});

//------------------ Department routes end ----------------------


//------------------ Users routes --------------------------

//route to login
app.get("/login", function (req, res) {
  res.render("login");
});

//route to register
app.get("/register", function (req, res) {
  res.render("register");
});

//login user
app.post("/login", function (req, res) {
  req.body.userAgent = req.get('User-Agent');

  dataServiceAuth.checkUser(req.body)
    .then(function (user) {
      req.session.user = {
        userName: user.userName, // complete it with authenticated user's userName
        email: user.email, // complete it with authenticated user's email
        loginHistory: user.loginHistory // complete it with authenticated user's loginHistory
      }
      res.redirect("/employees");
    })
    .catch(function (err) {
      res.render("login", {errorMessage: err, userName: req.body.userName});
    });

});

//register user
app.post("/register", function (req, res) {
  dataServiceAuth.registerUser(req.body)
    .then(function () {
      res.render("register", { successMessage: "User created" });
    })
    .catch(function (err) {
      res.render("register", { errorMessage: err, userName: req.body.userName });
    });
});

//route to logout
app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/login");
});

//route to get user history
app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

//------------------ Users routes end ----------------------

//page not found
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "/views/404notFound.html"));
});

//server start message
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// real files and then setup http server to listen on HTTP_PORT
data_service.initialize()
  .then(dataServiceAuth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(function (reason) {
    console.log(reason);
  });
