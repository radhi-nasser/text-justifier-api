const justifiedTextWidth = 80;


/* Open API documentation */
exports.docs = function (req, res) {
    res.send('Docs !!!');
}

/* Justify a text */
exports.justifyText = function (req, res) {

    let text = req.body;
    let words = text.split(/ |\r/);
    let nbWords = words.length;

    let lines = [];
    let line = '';
    let doNotJustify = [];

    for (let i = 0; i < nbWords; i++) {
        if (words[i] != '') {
            if (words[i] == '\n') {
                lines.push(line);
                line = '';
                doNotJustify.push(lines.length - 1);
            } else if (words[i].substr(0, 1) == '\n') {
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

    res.send(lines.join('\n'));
}

function justifyLines(lines, doNotJustify) {

    let nbLines = lines.length;

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

    let words = line.split(/ /);

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
exports.generateToken = function (req, res) {

    res.send(req.body);
}