import Order from '~/models/v2/order';
import Product from '~/models/v2/product';
import Bot from '~/common/tg-bot';
import nodemailer from 'nodemailer';

require('dotenv').config();

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

    generateReceipt(order) {
        function separateThousands(number) { return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

        const shippingMethods = {
            pickup: 'Самовывоз',
            carrier: 'Курьер магазина',
            dellin: `Деловые Линии`,
            pek: 'ПЭК',
            sdek: 'СДЭК',
            baikal: 'Байкал Сервис',
            custom: 'Свой способ'
        }

        const receipt = `
            <html style="font-family: 'Trebuchet MS';">
            <body style="color: rgb(19, 11, 69);">
                <h1
                    style="
                        width: 640px;
                        padding: 24px;
                        font-size: 24px;
                        text-align: center;
                        font-weight: bold;
                        font-style: italic;
                    "
                >
                    Ваш заказ принят в обработку, <br/>
                    мы свяжемся с Вами в ближайшее время.
                    <br/><br/>
                    Спасибо, что выбрали нас!
                </h1>
        
                <div 
                    style="
                        width: 640px;
                        padding: 24px;
                        border-radius: 24px;
                        border: 2px solid rgba(19, 11, 69, .6);
                        box-shadow: 0px 6px 12px rgba(5, 1, 26, 0.2);
                    "
                >
                    <img 
                        width="124"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/768px-LEGO_logo.svg.png"
                    >
                    <table
                        style="
                            width: 640px;
                            margin: 32px 0;
                            border: 2px solid rgba(19, 11, 69, .6);
                            border-collapse: collapse;
                        "
                    >
                    <tbody>
                        <tr style="text-align: left; border-bottom: 2px solid rgba(19, 11, 69, .6);">
                            <th 
                                style="
                                    font-size: 18px;
                                    line-height: 36px;
                                    padding: 0 16px;
                                "
                            >
                                Позиция
                            </th>
                            <th 
                                style="
                                    font-size: 18px;
                                    line-height: 36px;
                                    padding: 0 16px;
                                "
                            >
                                Количество
                            </th>
                            <th 
                                style="
                                    font-size: 18px;
                                    line-height: 36px;
                                    padding: 0 16px;
                                "
                            >
                                Цена (1 шт.)
                            </th>
                            <th 
                                style="
                                    font-size: 18px;
                                    line-height: 36px;
                                    padding: 0 16px;
                                "
                            >
                                Сумма
                            </th>
                        </tr>

                        ${
                            order.items.reduce((acc, {
                                sku,
                                attributes: { color, brand },
                                qty,
                                price
                            }) => 
                                acc +
                                `<tr
                                    style="
                                        font-size: 18px;
                                        line-height: 36px;
                                        padding: 0 16px;
                                    "
                                >
                                    <td
                                        style="
                                            font-size: 18px;
                                            line-height: 36px;
                                            padding: 0 16px;
                                        "
                                    >
                                        ${qty} шт.
                                    </td>
                                    <td
                                        style="
                                            font-size: 18px;
                                            line-height: 36px;
                                            padding: 0 16px;
                                        "
                                    >
                                        <b>${sku} <span style="opacity: .6;">(${color}/${brand})</span></b>
                                    </td>
                                    <td
                                        style="
                                            font-size: 18px;
                                            line-height: 36px;
                                            padding: 0 16px;
                                        "
                                    >
                                        ${price}руб./шт.
                                    </td>
                                    <td
                                        style="
                                            font-size: 18px;
                                            line-height: 36px;
                                            padding: 0 16px;
                                        "
                                    >
                                        ${price * qty}руб.
                                    </td>
                                </tr>`, ''
                            )
                        }
                        </tbody>
                    </table>
            
                    <span
                        style="
                            padding: 0 16px;
                            font-size: 18px;
                            line-height: 36px;
                        "
                    >
                        <b>Общая сумма заказа *:</b> 
                        <u>${separateThousands(order.items.reduce((acc, { price, qty }) => acc + price * qty, 0))}</u> руб.;</span> 
                    <br>
                    <span
                        style="
                            padding: 0 16px;
                            font-size: 18px;
                            line-height: 36px;
                        "
                    >
                        <b>Предпочитаемый способ доставки:</b> 
                        <u>${shippingMethods[order.shipping.method]}</u>;
                    </span>
                
                    <p
                        style="
                            padding: 0 16px;
                            font-size: 16px;
                        "
                    >
                        * Сумма заказа без учета стоимости доставки. <br>
                        Мы свяжемся с Вами, рассчитав стоимость доставки, <br>
                        учитывая Ваши пожелания.
                    </p>
                </div>
            </body>
        </html>
        `

        return receipt;
    },

    //sends message to chat via TG Bot
    sendTelegramMessage(order) {
        const options = { parse_mode: 'HTML' }
        const chat = '336709361';
        Bot.sendMessage(chat, module.exports.generateMessage(order), options);
    },

    //sends email receipt to customer
    sendEmailReceipt(order) {
        const transporter = nodemailer.createTransport({
            host: "smtp.yandex.ru",
            port: 465,
            secure: true,
            auth: {
                user: "info@matoon.store",
                pass: process.env.YANDEX_KEY
            }
        });

        const message = {
            from: 'sender',
            to: order.customer.mail,
            subject: 'Ваш заказ принят',
            html: module.exports.generateReceipt(order)
        }

        transporter.sendMail(message)
            .catch(console.error);
    },

    //TODO добавить сортировку по нескольким полям 
    getList(req, res, next) {
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

        Promise.all([
            Order.find({}, null, pagination).sort(sort),
            Order.count({})
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);

        // Order.find(filter, null, pagination).sort(sort)
        //     .sort(sort)
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;

        Order.findOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    async create(req, res, next) {
        const {body} = req;

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
                module.exports.sendEmailReceipt(result);
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