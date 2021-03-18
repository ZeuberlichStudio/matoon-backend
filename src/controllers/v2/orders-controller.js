import { Mongoose, SchemaTypes } from 'mongoose';
import Order from '~/models/v2/order';
import Product from '~/models/v2/product';
import Bot from '~/common/tg-bot';

module.exports = {
    //Returns text with order info
    generateMessage(order) {
        const { customer, shipping, payment, items } = order;

        function separateThousands(number) { return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

        const renderItem = ({
            sku,
            attributes: { color, brand },
            price,
            qty
        }) => `• ${sku} (${color}/${brand}) - ${price}руб. x ${qty}шт. (${separateThousands(price * qty)}руб.)\n`;

        const contactMethods = {
            mail: 'Почта',
            phone: 'Телефон',
            wapp: `What's App`,
            tg: 'Telegram',
            viber: 'Viber'
        }

        const shippingMethods = {
            pickup: 'Самовывоз',
            carrier: 'Курьер магазина',
            dellin: `Деловые Линии`,
            pek: 'ПЭК',
            sdek: 'СДЭК',
            baikal: 'Байкал Сервис',
            custom: 'Свой способ'
        }

        const paymentMethods = {
            cash: 'Наличными',
            tranfer: 'Перевод',
            bill: `Выставление счёта`
        }

        let message = 
        `<b>Номер заказа: ${order.publicId}</b>\n\n` +
        '<b>Покупатель</b> \n' +
        'Имя: ' + customer.name + '\n' +
        'Телефон: ' + customer.phone + '\n' +
        'Почта: ' + customer.mail + '\n' +
        'Предпочитаемый метод связи: ' + contactMethods[customer.contactBy] + '\n\n' +

        '<b>Доставка</b>\n' +
        'Способ доставки: ' + shippingMethods[shipping.method] + '\n' +
        ( 
            shipping.method === 'pickup' ? `Пункт самовывоза: ${shipping.pickupPoint}\n\n` :
            shipping.method === 'custom' ? `Описание способа доставки: ${shipping.comment}\n\n` :
            `Адрес доставки: ${shipping.address}\n\n`
        ) +

        '<b>Оплата</b>\n' +
        `Способ оплаты: ${paymentMethods[payment.method]}\n` +
        (
            payment.method === 'bill' ?
            `ИНН: ${payment.inn}\n` +
            `Компания: ${payment.companyName}\n` +
            `Юр. адрес: ${payment.companyAddress}\n\n` : '\n\n'
        ) +

        '<b>Заказ</b>\n';

        let total = 0;

        for (const item of items) { 
            total += item.price * item.qty;
            message += renderItem(item); 
        }

        message += `\n\n<b>Полная стоимость</b>: ${separateThousands(total)}руб.`;

        return message;
    },

    sendTelegramMessage(order) {
        const options = { parse_mode: 'HTML' }
        const chat = '336709361';
        Bot.sendMessage(chat, module.exports.generateMessage(order), options);
    },

    getList(req, res, next) {
        let filter = {};

        if ( req.query.page ) filter.page = req.query.page;
        if ( req.query.type ) filter.type = req.query.type;
        if ( req.query.cat ) filter.cats = { $in: [req.query.cat] };

        //Sorting documents
        const [field, order] = req.query.sort?.split(',') || [];

        const sort = (field && parseInt(order)) ? {
            [field]: parseInt(order)
        } : {
            _id: 1
        };

        //Pagination
        const { limit, skip } = req.query;

        const pagination = { 
            limit: limit ? parseInt(limit) : 0,
            skip: skip ? parseInt(skip) : 0
        };

        Order.find(filter, null, pagination).sort(sort)
            .sort(sort)
            .then(result => {
                res.header('X-Total-Count', result.length);
                res.json(result);
            })
            .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;

        Order.findOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    async create(req, res, next) {
        const {body} = req;

        console.log(body);

        const products = await Product.find({ _id: {$in: body.items} })
            .populate({
                path: 'variants.attributes.color',
                model: 'Color'
            })
            .populate({
                path: 'variants.attributes.brand',
                model: 'Brand'
            }).lean();

        const orderItems = body.items.map(({variantId, priceAmount, qty, ...item}) => {
            const { _id, sku, variants } = products.find(product => product._id.equals(item._id));
            const variant = variants.find(variant => variant._id.equals(variantId));

            return {
                product: _id,
                variant: variantId,
                sku: sku,
                attributes: {
                    color: variant.attributes.color.name,
                    brand: variant.attributes.brand.name
                },
                price: priceAmount,
                qty
            }
        });

        body.items = orderItems;

        Order.create(body)
            .then(result => {
                module.exports.sendTelegramMessage(result);
                res.json(result.publicId);
            })
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Order.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Order.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Order.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}