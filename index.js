const mysql = require('mysql');
const inq = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    // Your port, if not 3306
    port: 3306,
    // Your username
    user: 'root',
    // Be sure to update with your own MySQL password!
    password: 'password',
    database: 'employeeTracker_db',
});

// const addEmployee = function () {
//     let roles;
//     connection.query("SELECT title FROM role", function (err, result) {
//         if (err) throw err;
//         roles = result
//     })
//     inq.prompt([
//         {
//             name: "role",
//             type: "list",
//             message: "What type of employee are you adding?",
//             choices: roles
//         },
//         {
//             name: 'firstName',
//             type: 'input',
//             message: "What is the employee's first name?"
//         },
//         {
//             name: 'lastName',
//             type: 'input',
//             message: 'What is their last name?'
//         },
//         {
//             name: 'managerId',
//             type: 'input',
//             message: 'What is the ID of their manager?'
//         }
//     ])
//     .then(answers => {
//         let roleId = connection.query('SELECT id FROM role WHERE ?', { role: answers.role })
//         connection.query('INSERT INTO employee (first_name, last_name, role_id, manager) VALUES ?', {
//             first_name: answers.firstName,
//             last_name: answers.lastName,
//             role_id: roleId[0],
//             manager_id: answers.manager_id
//         })
//         connection.end();
//     })
// }

const viewRoles = function() {
    connection.query("SELECT * FROM role", function (err, result) {
        if (err) throw err;
        console.table(result);
    })
}

const viewEmployees = function() {
    connection.query("SELECT * FROM employee", function (err, result) {
        if (err) throw err;
        console.table(result);
    })
}

const viewDepts = function() {
    connection.query("SELECT * FROM department", function (err, result) {
        if (err) throw err;
        console.table(result);
    })
}

const addDept = function() {
    inq.prompt([
        {
            name: "name",
            type: 'input',
            message: 'What is the name of the new department?'
        }
    ])
    .then(answer => {
        connection.query(`INSERT INTO department SET ?`, {name: answer.name}, function (err) {
            if (err) throw err;
        })
        start();
    })

}

const addRole = function() {
    inq.prompt([
        {
            name: "title",
            type: 'input',
            message: 'What is the title of the new role?'
        },
        {
            name: "salary",
            type: 'input',
            message: 'What is the annual salary for the new role?'
        },
        {
            name: 'department',
            type: 'input',
            message: 'What department does this role belong to?'
        }
    ])
    .then(answer => {
        let deptID;
        connection.query('SELECT * FROM department WHERE ?', {name: answer.department}, function (err, res) {
            console.log(res);
            deptID = res[0].id;
            console.log(deptID);
            connection.query(`INSERT INTO role SET ?`, {title: answer.title, salary: answer.salary, department_id: deptID}, function (err) {
                if (err) throw err;
                start();
            })
        })
        
       
    })
}

const addEmployee = function() {
    let roles = [];
    connection.query('SELECT * FROM role', function (err, res) {
        res.forEach(item => {
            roles.push(item.title);
        })
        inq.prompt([
            {
                name: "role",
                type: "list",
                message: "What type of employee are you adding?",
                choices: roles
            },
            {
                name: 'firstName',
                type: 'input',
                message: "What is the employee's first name?"
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'What is their last name?'
            },
            {
                name: 'managerId',
                type: 'input',
                message: 'What is the ID of their manager?'
            }
        ])
        .then(answer => {
            let roleID;
            let managerID;
            if (answer.managerId === '') {
                managerID = null;
            } else {
                managerID = answer.managerId;
            }
            connection.query('SELECT * FROM role WHERE?', {title: answer.role}, function (err, res) {
                roleID = res[0].id;
                connection.query('INSERT INTO employee SET ?', {role_id: roleID, first_name: answer.firstName, last_name: answer.lastName, manager_id: managerID})
                start();
            })
          
           
        })
    })
   
}

const updateEmployee = function() {
    // viewEmployees();
    // viewRoles();
    let employees = [];
    let roles = [];
    connection.query('SELECT first_name, last_name FROM employee', function (err, res) {
        if (err) throw err;
        res.forEach(item => {
            employees.push(item.first_name+' '+item.last_name)
        })
        console.log(employees)
        connection.query('SELECT * FROM role', function (err, res) {
            if (err) throw err;
            res.forEach(item => {
                roles.push(item.title)
            })
            inq.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee are you updating?',
                    choices: employees
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: 'What is their new role?',
                    choices: roles
                }
            ])
            .then(answers => {
                let roleID;
                let employeeID;
                connection.query('SELECT id FROM role WHERE ?', { title: answers.newRole }, function (err, res) {
                    roleID = res[0].id;
                })

                let firstName = answers.employee.split(' ')[0]
                let lastName = answers.employee.split(' ')[1]
                // console.log(firstName);
                // console.log(lastName);
                connection.query('SELECT id FROM employee WHERE ?', [{first_name: firstName}, {last_name: lastName}], function (err, res) {
                    if (err) throw err;
                    console.log(res);
                    employeeID = res[0].id;
                })
                connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [ roleID, employeeID ], function(err) {
                    if (err) throw err;
                    start();
                })
            })
        })
    })
   


}

const viewByManager = function() {
    let employees = [];
    connection.query('SELECT first_name, last_name FROM employee', function (err, res) {
        if (err) throw err;
        res.forEach(item => {
            employees.push(item.first_name+' '+item.last_name)
        })
        inq.prompt([
            {
                name: 'manager',
                type: 'list',
                choices: employees
            }
        ])
        .then(answer => {
            let firstName = answer.manager.split(' ')[0]
            let lastName = answer.manager.split(' ')[1]
            connection.query('SELECT id FROM employee WHERE ?', [{first_name: firstName}, {last_name: lastName}], function (err, res) {
                if (err) throw err;
                let managerID = res[0].id
                connection.query('SELECT * FROM employee WHERE ?', {manager_id: managerID}, function (err, res) {
                    console.table(res);
                    start();
                })
            })
        })
    })
}

const start = function() {
    inq.prompt([
        {
            name: "choice",
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'VIEW DEPARTMENTS',
                'ADD DEPARTMENT',
                'VIEW ROLES',
                'ADD ROLE',
                'VIEW EMPLOYEES',
                'ADD EMPLOYEE',
                'UPDATE EMPLOYEE ROLE',
                'VIEW EMPLOYEES BY MANAGER',
                'DONE'
            ]
        }
    ])
    .then(answer => {
        switch (answer.choice) {
            case 'VIEW DEPARTMENTS':
                viewDepts();
                start();
                break;
            case 'ADD DEPARTMENT':
                addDept();
                break;
            case 'VIEW ROLES': 
                viewRoles();
                start();
                break;
            case 'ADD ROLE':
                addRole();
                break;
            case 'VIEW EMPLOYEES':
                viewEmployees();
                start();
                break;
            case 'ADD EMPLOYEE':
                addEmployee();
                break;
            case 'UPDATE EMPLOYEE ROLE':
                updateEmployee();
                break;
            case 'VIEW EMPLOYEES BY MANAGER':
                viewByManager();
                break;
            case 'DONE':
                process.exit(0);
                break;
        }
    })
}

connection.connect(err => {
    if (err) throw err;
    start();
})

