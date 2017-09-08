// using Node.js, ES6 and the NPM Request module with native promise
'use strict'
const request = require('request-promise-native')

function getInvalidCustomers (page, invalids) {
	const options = {
	  method: 'GET',
	  uri: 'https://backend-challenge-winter-2017.herokuapp.com/customers.json',
	  json: true,
	  qs: {
		  page: page
	  }
	}
	request(options)
		.then(response => {
			let total_page = (response.pagination.total + response.pagination.per_page - 1) / response.pagination.per_page,
				curr_page = response.pagination.current_page
			invalids.push.apply(invalids, validateCustomers(response.customers, response.validations))
			if (curr_page === total_page) {
				// final result
				console.log(invalids)
			} else {
				return getInvalidCustomers(page + 1, invalids)
			}
		})
		.catch(err => console.log(err))
}

function validateCustomers (customers, validations) {
	let result = []
	for (let i = 0; i < customers.length; i++) {
		let customer = customers[i]
		let invalidFields = []
		let valid = true
		for (let j = 0; j < validations.length; j++) {
			let validation = validations[j],
				validationKey = Object.keys(validation)[0],
				invalidField = validateField(customer[validationKey], validation)
			if (invalidField) {
				invalidFields.push(invalidField)
				valid = false
			}
		}
		if (!valid)
			result.push({id: customer.id, invalid_fields: invalidFields})
	}
	return result
}

function validateField (field, validation) {
	let key = Object.keys(validation)[0],
		validation_values = validation[key]
	if (field !== null) {
		if (validation_values.hasOwnProperty('type')) {
			if ((validation_values.type === 'boolean' && typeof field !== 'boolean') ||
				(validation_values.type === 'number' && !isNumeric(field)) ||
				(validation_values.type === 'string' && typeof field !== 'string'))
				return key
		}
		if (validation_values.hasOwnProperty('length')) {
			let min = validation_values.length.min || Number.NEGATIVE_INFINITY,
				max = validation_values.length.max || Infinity
			if (field.length < min || field.length > max)
				return key
		}
	} else if (field === null && validation_values.hasOwnProperty('required') && validation_values.required)
		return key
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

getInvalidCustomers(1, [])
