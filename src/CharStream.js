export default class CharStream {
    constructor(data, cursor, row, column) {
        this.data = data;
        this.cursor = cursor;
        this.row = row;
        this.column = column;
        Object.freeze(this);
    }

    advance() {
        const char = this.data[this.cursor];
        const newStream =
            char === '\n'
            ? new CharStream(this.data, this.cursor + 1, this.row + 1, 1)
            : new CharStream(this.data, this.cursor + 1, this.row, this.column + 1);
        return { char: char, stream: newStream };
    }

    static FromString(string) {
        return new CharStream(string, 0, 1, 1);
    }
}