var axios = require('axios');

exports.getGender = (name) => {

    try {
        
        name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        name = name.replace(/[^\w\s]/gi, '');
        name = name.trim();
        name = name.split(' ')[0];

        return axios.get('https://api.genderize.io/?name=' + name + "&country_id=br").then((response) => {
            return response.data.gender;
        }).catch((err) => {
            console.error(err);
            return null;
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}