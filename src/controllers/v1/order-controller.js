import Order from '../models/order';
import Variation from '../models/variation';
import bot from '../tg-bot';

exports.getOrder = async function getOrder(req, res, next) {
    const orderID = req.params.id;
    const query = Order.findOne({ _id: orderID }).exec();

    try {
        const result = await query;
        res.json(result);
    } catch (err) {
        next(err);
    }
}

exports.postOrder = async function postOrder(req, res, next) {
    const orderObj = {...req.body};
    const query = Order.create(orderObj);

    try {
        const result = await query;
        res.json({ publicId: result.publicId });
        req.orderId = result._id;
        next();
    } catch (err) {
        next(err);
    }
}

async function generateMessageText(orderId, next) {
    const query = Order.findOne({ _id: orderId }).exec();

    try {
        const result = await query;
        const text = 
        `<b>О покупателе</b>` +
        `\nИмя: ${result.customer.name}` +
        `\nТелефон: ${result.customer.phone}` +
        `\nЭл.почта: ${result.customer.mail}`;

        return text;
    } catch (err) {
        next(err);
    }
}

exports.messageOrder = async function messageOrder(req, res, next) {
    const chatId = '@hello_humanz';

    try {
    const text = await generateMessageText(req.orderId, next);

    bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    } catch (err) {
        next(err);
    }
}