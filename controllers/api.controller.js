const User = require('../models/user.model');

const justifiedTextWidth = 80;
const rateLimit = 80000;


/* Open API documentation */
module.exports.showDocs = function(req, res) {
    res.send('Docs !!!');
};

/* Justify a text */
module.exports.justifyText = function(req, res) {

    // check if the user is authorized to make this request
    checkAuthorizationToken(req.headers).then(
        (user) => {

            let text = req.body;

            let today = new Date().toJSON().slice(0, 10);

            // check the words limit per day
            let actualNbWords = (text.split(/ |\r|\n/)).length;

            if (actualNbWords > rateLimit ||
                (user.quotas.hasOwnProperty(today) && user.quotas[today] + actualNbWords > rateLimit)) {

                res.status(402);
                res.send({
                    'Error': 'Payment Required.'
                });
                return;
            }

            // we don't split here by \n to keep the line breaks position, we will handle the line breaks after
            let words = text.split(/ |\r/);
            let nbWords = words.length;

            let lines = []; // an array of lines
            let currentLine = ''; // the current line
            let doNotJustify = []; // an array to keep the lines which are not gonna need jstification, such as the last line in a paragraph

            // loop throught the words list
            for (let i = 0; i < nbWords; i++) {

                let word = words[i];

                // overpass mpty words/lines
                if (word === '' || word === '\n')
                    continue;

                // if the word contain a line break(s)
                if (word.indexOf('\n') > -1) {

                    // split by the line break(s)
                    let innerWords = word.split(/\n/);
                    let innerWordsLength = innerWords.length;

                    for (let j = 0; j < innerWordsLength; j++) {

                        let innerWord = innerWords[j];

                        // if it's an empty word then it's a line break
                        if (innerWord === '') {
                            // if the current line contains somthing add it to the lines array and reiniatilize the currentLine
                            if (currentLine.length > 0) {
                                lines.push(currentLine);
                                doNotJustify.push(lines.length - 1); // mark the line number to not to be justified beacause it's a paragraph last line
                                currentLine = '';
                            }
                        } else {

                            // add the word if the currentLine is empty
                            if (currentLine.length == '') {
                                currentLine = innerWord;
                            }
                            // else check if if it can fit in the currentLine before pushing it
                            else if (currentLine.length + 1 + innerWord.length <= justifiedTextWidth) {
                                currentLine += ' ' + innerWord;
                                lines.push(currentLine);
                                doNotJustify.push(lines.length - 1);
                                currentLine = '';
                            }
                            // the word does not fit, push the currentLine then push it
                            else {
                                lines.push(currentLine);
                                doNotJustify.push(lines.length - 1);
                                //currentLine = innerWord;
                                currentLine = '';
                                lines.push(innerWord);
                            }
                        }
                    }
                }
                // word does not contian a line break
                if (word.indexOf('\n') == -1) {

                    // handle words with length greater tha justifiedTextWidth
                    if (word.length > justifiedTextWidth) {

                        // substract 1 character, if the line is empty, for the - character at the end
                        // substract 2 character, if the line is empty, for the space before the word and the - character at the end
                        let remainingCharactersNumber = justifiedTextWidth - currentLine.length - (currentLine.length == 0 ? 1 : 2);

                        // loop throught the big word and split it to fit multiple lines while adding - at the end of each used line to represent that it's a long
                        while (remainingCharactersNumber > 0 && word.length != 0) {

                            let newWord = word.substr(0, remainingCharactersNumber);
                            word = word.substr(remainingCharactersNumber);

                            currentLine += (currentLine.length == 0 ? '' : ' ') + newWord + '-';
                            if (currentLine.length == justifiedTextWidth) {
                                lines.push(currentLine);
                                currentLine = '';
                            }
                            remainingCharactersNumber = justifiedTextWidth - currentLine.length - (currentLine.length == 0 ? 1 : 2);
                        }
                        if (currentLine.endsWith('-'))
                            currentLine = currentLine.substr(0, currentLine.length - 1);
                    }
                    // handle 'normal' words
                    else {

                        if (currentLine.length + word.length + (currentLine.length == 0 ? 0 : 1) <= justifiedTextWidth) {
                            currentLine += (currentLine.length == 0 ? '' : ' ') + word;
                        } else {
                            lines.push(currentLine);
                            currentLine = word;
                        }
                    }
                }
            }

            // add the last line to lines array if it's empty
            if (currentLine.length >= 0) {
                lines.push(currentLine);
                doNotJustify.push(lines.length - 1);
            }

            // justify the lines and ignore those whos index exist in the doNotJustify array
            lines = justifyLines(lines, doNotJustify);

            let quotas = user.quotas;

            // if user have made requests today, add the actualNbWords to his quota
            if (quotas.hasOwnProperty(today))
                quotas[today] += actualNbWords;
            // else create the user initialize today quota with the actualNbWords
            else
                quotas[today] = actualNbWords;

            // update the user in the database
            User.updateOne({ 'token': user.token }, { $set: { 'quotas': quotas } }, function(error, user) {

                if (error) {

                    res.status(500);
                    res.send(error);
                    return;
                }

                // sen the result
                res.send(lines.join('\n'));
            });

        },
        (error) => {
            res.status(error.code);
            res.send({
                'Error': error.message
            });
        }
    );

};

function checkAuthorizationToken(headers) {

    return new Promise(function(resolve, reject) {

        // if there's no authorization header
        if (!headers.hasOwnProperty('authorization')) {

            reject({
                code: 401,
                message: 'No credentials sent.'
            });
            return;
        }

        // get the header and trim it
        let authorizationHeader = (headers.authorization).trim();

        // if it's does start with 'Bearer '
        if (!authorizationHeader.startsWith('Bearer ')) {

            reject({
                code: 400,
                message: 'Wrong credentials format.'
            });
            return;
        }

        // get the token
        let token = authorizationHeader.substring(7, authorizationHeader.length);

        // check if there's a user with that token
        User.findOne({ 'token': token }, (error, user) => {

            if (error) {

                reject({
                    code: 500,
                    message: error
                });
                return;
            }

            // if the user does not exist, send an error
            if (!user) {

                reject({
                    code: 401,
                    message: 'Wrong credentials.'
                });
                return;
            }

            // send back the user
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
    if (line == '')
        return line;

    let nbRemainedCharacters = justifiedTextWidth - lineLength;

    if (nbRemainedCharacters == 0)
        return line;

    line = addSpaces(line, nbRemainedCharacters);

    return line;
}

function addSpaces(line, nbRemainedCharacters) {

    let words = line.split(' ');

    let nbWords = words.length;

    if (nbWords == 1)
        return line + ' '.repeat(nbRemainedCharacters);

    let nbSpaces = nbWords - 1;
    let spaces = Array(nbWords).fill(1); // create an array of 1 in each cell, represting the number of spaces between words

    let level = 2;

    // calculate the new spaces values
    while (nbRemainedCharacters > 0) {
        for (let i = 0; i < nbSpaces && nbRemainedCharacters != 0; i++) {
            spaces[i] = level;
            nbRemainedCharacters--;
        }
        level++;
    }

    // append the first word
    line = words[0];

    // add the word and the spaces to the string
    for (let i = 1; i < nbWords; i++)
        line += ' '.repeat(spaces[i - 1]) + words[i];

    return line;
}

/* Generate a token for a user */
module.exports.generateToken = function(req, res) {

    // check if an email is send
    if (Object.keys(req.body).length !== 1 || !req.body.hasOwnProperty('email')) {

        res.status(400);
        res.send({
            'Error': 'Only email field needed.'
        });
        return;
    }

    // finf the user or create it
    User.findOneOrCreate({ 'email': req.body.email }, (error, user) => {

        if (error) {
            // handle the validator error
            if (error.hasOwnProperty('name') && error.name === 'ValidationError') {
                res.status(400);
                res.send({
                    'Error': error.errors.email.message
                });
            } else {
                res.status(500);
                res.send(error);
            }
            return;
        }

        // send the token
        res.send({
            token: user.token
        });
    });
};
