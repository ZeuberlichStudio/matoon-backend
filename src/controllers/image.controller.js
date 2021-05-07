const {
    getImageRecord,
    getImageRecordsList,
    createImageRecord,
    // deleteImage,
    deleteImageRecord,
    checkIfImageRecordExists,
} = require('~/services/image.service');
const multer  = require('multer')

module.exports = {
    async getImageRecord(req, res, next) {
        try {
            const {_id} = req.params;
            const record = await getImageRecord(_id);
            
            res.send(record);
        } catch (err) {
            next(err);
        }
    },

    async getImageRecordsList(req, res, next) {
        try {
            const recordsList = await getImageRecordsList();

            res.send(recordsList);
        } catch (err) {
            next(err);
        }
    },
    
    uploadImages: multer({ 
        storage: multer.diskStorage({
            destination: 'public/images/',
            filename: function(req, file, cb) {
                const date = new Date().toISOString().split('T')[0];
                const random = Math.round(Math.random() * 1E9);
                const filename = `${date}-${random}-${file.originalname}`;
                
                cb(null, filename);
            }
        })
    }).array('images', 50),

    async createImageRecords(req, res, next) {
        try {
            const {files} = req;
            const queries = files.map(file => createImageRecord({ name: file.filename, path: file.destination + file.filename }));
            const result = await Promise.all(queries);

            res.send(result);
        } catch (err) {
            next(err);
        }
    },

    // async deleteImage(req, res, next) {
    //     try {
    //         const {_id} = req.params;
    //         const {path} = await getImageRecord(_id,);
    //         const result = await deleteImage(path,() => deleteImageRecord(_id));

    //         res.send(result);
    //     } catch (err) {
    //         next(err);
    //     }
    // },
}