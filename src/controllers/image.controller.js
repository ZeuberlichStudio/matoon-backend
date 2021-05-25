const ImageService = require('../services/ImageService');

module.exports = {
    async getImageRecord(req, res, next) {
        try {
            const {_id} = req.params;
            const { result } = await ImageService.getRecord(_id);
            
            res.send(result);
        } catch (err) {
            next(err);
        }
    },

    async getImageRecordsList(req, res, next) {
        try {
            const { result } = await ImageService.getRecords();

            res.send(result);
        } catch (err) {
            next(err);
        }
    },
    
    async createImage(req, res) {
        try {
            let records = [];

            for ( const { originalname, buffer } of req.files ) {
                const [name] = originalname.split('.');  
                const pathname = name => `public/images/${name}`;
                const sizeTiny = { width: 128 },
                      sizeSmall = { width: 256 },
                      sizeMedium = { width: 512 },
                      sizeLarge = { width: 1024 },
                      sizeOriginal = { width: 1920 };

                await Promise.all([
                    ImageService.saveImage(buffer, pathname(`${name}.jpeg`), { size: sizeOriginal }),
                    ImageService.saveImage(buffer, pathname(`${name}_tiny.jpeg`), { size: sizeTiny }),
                    ImageService.saveImage(buffer, pathname(`${name}_small.jpeg`), { size: sizeSmall }),
                    ImageService.saveImage(buffer, pathname(`${name}_medium.jpeg`), { size: sizeMedium }),
                    ImageService.saveImage(buffer, pathname(`${name}_large.jpeg`), { size: sizeLarge }),
                ]);

                const result = await ImageService.createRecord({
                    name: `${name}.jpeg`,
                    path: pathname(`${name}.jpeg`),
                    sizes: {
                        tiny: {
                            name: `${name}_tiny.jpeg`,
                            path: pathname(`${name}_tiny.jpeg`)
                        },
                        small: {
                            name: `${name}_small.jpeg`,
                            path: pathname(`${name}_small.jpeg`)
                        },
                        medium: {
                            name: `${name}_medium.jpeg`,
                            path: pathname(`${name}_medium.jpeg`)
                        },
                        large: {
                            name: `${name}_large.jpeg`,
                            path: pathname(`${name}_large.jpeg`)
                        }
                    }
                });

                records.push(result.result);
            }

            res.send(records);
        } catch (error) {
            res.status(500).send(error);
        }
    },

    async deleteImage(req, res) {
        try {
            const { record } = await ImageService.deleteRecord(req.params._id);
            
            await Promise.all([
                deleteImage(record.pathname),
                deleteImage(record.sizes.tiny.pathname),
                deleteImage(record.sizes.small.pathname),
                deleteImage(record.sizes.medium.pathname),
                deleteImage(record.sizes.large.pathname)
            ]);

            res.send();
        } catch (error) {
            res.status(500).send(error);
        }
    }
}