const Image = require('~/models/image.model.js');
const fsPromises = require('fs').promises;

module.exports = {
    getImageRecord(_id) {
        return Image.findOne({_id})
            .then(result => result)
            .catch(err => { throw err; /* new Error('error retrieving image record') */ });
    },

    getImageRecordsList(query, fields, sort, page, limit) {
        return Image.find(query, fields, { 
            skip: page - 1 * limit,
            limit,
            sort
        })
            .then(result => result)
            .catch(err => { throw err; /* new Error('error retrieving image records list') */ });
    },

    createImageRecord(image) {
        return Image.create(image)
            .then(result => result)
            .catch(err => { throw err; /* new Error('error creating image record') */ });
    },

    deleteImageRecord(_id) {
        return Image.deleteOne({_id})
            .then(result => result)
            .catch(err => { throw err; /* new Error('error deleting image record') */ });
    },

    checkIfImageRecordExists(path) {
        return Image.findOne({path})
            .then(result => !!result)
            .catch(err => { throw err; /* new Error('error checking image record presence') */ });
    },

    deleteImage(path, onsuccess) {
        return fsPromises.unlink(path)
            .then(() => onsuccess())
            .catch(err => { throw err; });
    }
}