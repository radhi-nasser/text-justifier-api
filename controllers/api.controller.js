const User = require('../models/user.model');

const justifiedTextWidth = 80;
const rateLimit = 80000;


/* Open API documentation */
module.exports.showDocs = function(req, res) {
    res.send('Docs !!!');
};

/* Justify a text */
module.exports.justifyText = function(req, res) {

    checkAuthorizationToekn(req.headers).then(
        (user) => {

            let text = req.body;

            let today = new Date().toJSON().slice(0, 10);

            let actualNbWords = (text.split(/ |\r/)).length;

            if (actualNbWords > rateLimit ||
                (user.quotas.hasOwnProperty(today) && user.quotas[today] + actualNbWords > rateLimit)) {

                res.status(402);
                res.send({
                    'Error': 'Payment Required.'
                });
                return;
            }

            let words = text.split(/ |\r/);
            let nbWords = words.length;

            let lines = [];
            let line = '';
            let doNotJustify = [];

            for (let i = 0; i < nbWords; i++) {
                if (words[i] != '' && words[i] != '\n') {
                    if (words[i].substr(0, 1) == '\n') {
                        lines.push(line);
                        doNotJustify.push(lines.length - 1);
                        line = words[i].substr(1);
                    } else {
                        if (line.length + words[i].length + (line.length == 0 ? 0 : 1) <= justifiedTextWidth) {
                            line += (line.length == 0 ? '' : ' ') + words[i];
                        } else {
                            lines.push(line);
                            line = words[i];
                        }
                    }
                }
            }

            if (line != '')
                lines.push(line);

            lines = justifyLines(lines, doNotJustify);

            if (user.quotas.hasOwnProperty(today))
                user.quotas[today] += actualNbWords;
            else
                user.quotas[today] = actualNbWords;

            User.updateOne(user, function(error) {

                if (error) {

                    res.status(500);
                    res.send(error);
                    return;
                }

                res.send(lines.join('\n'));
            });

        },
        (error) => {
            res.status(error.code);
            res.send(error.message);
        }
    );

};

function checkAuthorizationToekn(headers) {

    return new Promise(function(resolve, reject) {

        if (!headers.hasOwnProperty('authorization')) {

            reject({
                code: 401,
                message: 'No credentials sent.'
            });
            return;
        }

        let authorizationHeader = (headers.authorization).trim();

        if (!authorizationHeader.startsWith('Bearer ')) {

            reject({
                code: 400,
                message: 'Wrong credentials format.'
            });
            return;
        }

        let token = authorizationHeader.substring(7, authorizationHeader.length);

        User.findOne({ 'token': token }, (error, user) => {

            if (error) {

                reject({
                    code: 500,
                    message: error
                });
                return;
            }

            if (!user) {

                reject({
                    code: 401,
                    message: 'Wrong credentials.'
                });
                return;
            }

            resolve(user);
        });

    });

}

function justifyLines(lines, doNotJustify) {

    let nbLines = lines.length;

    if (nbLines == 1)
        return lines;

    for (let i = 0; i < nbLines; i++)
        if (doNotJustify.indexOf(i) == -1)
            lines[i] = justifyLine(lines[i]);

    return lines;
}

function justifyLine(line) {

    let lineLength = line.length;
    let nbRemainedCharacters = justifiedTextWidth - lineLength;

    if (nbRemainedCharacters == 0)
        return line;

    line = addSpaces(line, nbRemainedCharacters);

    return line;
}

function addSpaces(line, nbRemainedCharacters) {

    let words = line.split(' ');

    let nbWords = words.length;

    let nbSpaces = nbWords - 1;
    let spaces = Array(nbWords).fill(1);

    let level = 2;

    while (nbRemainedCharacters > 0) {
        for (let i = 0; i < nbSpaces && nbRemainedCharacters != 0; i++) {
            spaces[i] = level;
            nbRemainedCharacters--;
        }
        level++;
    }

    line = words[0];

    for (let i = 1; i < nbWords; i++)
        line += ' '.repeat(spaces[i - 1]) + words[i];

    return line;
}

/* Generate a token for a user */
module.exports.generateToken = function(req, res) {

    if (Object.keys(req.body).length !== 1 || !req.body.hasOwnProperty('email')) {

        res.status(400);
        res.send({
            'Error': 'Only email field needed.'
        });
        return;
    }

    User.findOneOrCreate({ 'email': req.body.email }, (error, user) => {

        if (error) {
            res.status(400);
            res.send(error);
            return;
        }

        res.send({
            token: user.token
        });
    });
};
