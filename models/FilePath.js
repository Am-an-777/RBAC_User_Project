const mongoose = require('mongoose');

const filePathSchema = new mongoose.Schema({
    file_url:
        {
           type:String,
           required:true
        }
});


module.exports = mongoose.model('Img',filePathSchema)