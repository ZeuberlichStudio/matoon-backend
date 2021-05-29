const Image = require('../models/image');
const sharp = require('sharp');
const fsPromises = require('fs/promises');

module.exports = {
    async createRecord(payload) {
        try {
            const result = await Image.create(payload);

            return { success: true, result };
        } catch (error) {
            return { success: false, error };
        }
    },

    async updateRecord(id, payload) {
        try {
            const result = await Image.findByIdAndUpdate(id, payload);

            return { success: true, result };
        } catch (error) {
            return { success: false, error };
        }
    },

    async deleteRecord(id) {
        try {
            const result = await Image.findByIdAndDelete(id);

            return { success: true, result };
        } catch (error) {
            return { success: false, error };    
        }
    },

    async getRecord(id, params) {
        try {
            const result = id ? await Image.findById(id) : await Image.findOne(params);

            return { success: true, result };
        } catch (error) {
            return { success: false, error };    
        }
    },

    //TODO добавить агрегацию
    async getRecords(filters) {
        try {
            const result = await Image.find(filters);

            return { success: true, result };
        } catch (error) {
            return { success: false, error };    
        }
    },

    async saveImage(buffer, pathname, options) {
        try {
            const processedBuffer = await sharp(buffer)
                .resize(options.size)
                .jpeg({
                    quality: 85,
                    mozjpeg: true
                })
                .toBuffer();

            await fsPromises.mkdir(pathname, { recursive: true });
            await fsPromises.writeFile(pathname, processedBuffer, { flags: options.rewrite ? '' : 'wx' });

            return { success: true, result: pathname };
        } catch (error) {
            return { success: false, error };
        } 
    },

    async deleteImage(pathname) {
        try {
            await fsPromises.rm(pathname);

            return { success: true, result: null };
        } catch (error) {
            return { success: false, error };
        }
    }
}