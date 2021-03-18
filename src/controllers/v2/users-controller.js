import User from '~/models/v2/user';
import bcrypt from 'bcrypt';

module.exports = {
    getList(req, res, next) {
        User.find()
            .then(result => res.send(result))
            .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;

        User.findOne({_id})
            .then(result => res.send(result))
            .catch(next);
    },

    async create(req, res, next) {
        const {body} = req;
        const user = new User({...body});

        user.password = await bcrypt.hash(user.password, 10);

        user.save()
            .then(doc => res.header('x-auth-token', doc.generateToken()).send(doc))
            .catch(next);
    },

    async issueToken(req, res, next) {
        const { body } = req;

        try {
            const user = await User.findOne({ username: body.username });

            if ( !user ) return res.send('No user found');

            bcrypt.compare(body.password, user.password)
                .then(result => {
                    if ( !result ) throw error;
                    res.json(user.generateToken());
                })
                .catch(() => res.status(401).send('Access denied.'));
        } catch (error) {
            next(error);
        }
    }
}