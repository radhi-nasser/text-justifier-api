module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": ["error", { "argsIgnorePattern": "next|user|res" }],
        'no-console': 'off'
    },
    "globals": {
        "emit": true,
        "describe": true,
        "it": true,
        "beforeEach": true,
        "before": true,
        "after": true,
        "expect": true
    },
    "parserOptions": {
        "sourceType": "module"
    }
};
