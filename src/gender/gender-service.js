var axios = require('axios');

exports.isFemale = (name) => {

    name = name.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    return axios.get('https://api.genderize.io/?name=' + name + '&country_id=br').then((response) => {
        return response.data.gender === 'female';
    }).catch((err) => {
        throw err;
    });
}