var axios = require('axios');

exports.getGender = (name) => {

    name = name.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    return axios.get('https://api.genderize.io/?name=' + name).then((response) => {
        return response.data.gender;
    }).catch((err) => {
        throw err;
    });
}