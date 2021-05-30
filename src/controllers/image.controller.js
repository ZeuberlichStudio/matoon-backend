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
            const filters = {};
            
            if ( req.query.name ) filters.name = { $in: req.query.name.split(',') };

            const { result } = await ImageService.getRecords(filters);

            res.send(result);
        } catch (err) {
            next(err);
        }
    },
    
    async createImage(req, res) {
        try {
            let records = [];

            for ( const file of req.files ) {
                const [name] = file.originalname.split('.');  
                const pathname = name => `public/images/${name}`;
                const imageCheck = await ImageService.getRecord(null, { path: pathname(`${name}.jpeg`) });

                if ( imageCheck.result ) throw new Error(`Файл с названием ${name}.jpeg уже существует.`);

                const sizeTiny = { width: 128 },
                      sizeSmall = { width: 256 },
                      sizeMedium = { width: 512 },
                      sizeLarge = { width: 1024 },
                      sizeOriginal = { width: 1920 };

                const originalPathname = await ImageService.saveImage(file.buffer, pathname(`${name}.jpeg`), { size: sizeOriginal });

                delete file['buffer'];

                await Promise.all([
                    ImageService.saveImage(originalPathname, pathname(`${name}_tiny.jpeg`), { size: sizeTiny }),
                    ImageService.saveImage(originalPathname, pathname(`${name}_small.jpeg`), { size: sizeSmall }),
                    ImageService.saveImage(originalPathname, pathname(`${name}_medium.jpeg`), { size: sizeMedium }),
                    ImageService.saveImage(originalPathname, pathname(`${name}_large.jpeg`), { size: sizeLarge }),
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

            // const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
            // console.log(`Approx ${Math.round(memoryUsed * 100) / 100}MB`);
        } catch (error) {
            res.status(500).send(error.message);
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