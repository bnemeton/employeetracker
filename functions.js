const mysql = require('mysql');
const inq = require('inquirer');
const cTable = require('console.table');



const addEmployee = function () {
    let roles = connection.query("SELECT title FROM role")
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
    .then(answers => {
        let roleId = connection.query('SELECT id FROM role WHERE ?', { role: answers.role })
        connection.query('INSERT INTO employee (first_name, last_name, role_id, manager) VALUES ?', {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: roleId[0],
            manager_id: answers.manager_id
        })
    })
}

module.exports = addEmployee;