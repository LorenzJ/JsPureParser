import CharStream from './CharStream';

describe("CharStream", () => {
    const stream = CharStream.FromString("a\nbc");
    
    test("will get a char", () => {
        const { char: char1, stream: _ } = stream.advance();
        expect(char1).toEqual('a');
    });

    test("will get many chars", () => {
        const { char: char1, stream: stream1 } = stream.advance();
        const { char: char2, stream: stream2 } = stream1.advance();
        const { char: char3, stream: stream3 } = stream2.advance();
        const { char: char4, stream: stream4 } = stream3.advance();
        const { char: char5, stream: _ } = stream4.advance();
        expect(char1).toBe('a');
        expect(char2).toBe('\n');
        expect(char3).toBe('b');
        expect(char4).toBe('c');
        expect(char5).toBeUndefined();
    });

    test("recognizes new lines", () => {
        const { stream: stream1 } = stream.advance();
        expect(stream1.column).toBe(2);
        expect(stream1.row).toBe(1);
        const { stream: stream2 } = stream1.advance();
        expect(stream2.column).toBe(1);
        expect(stream2.row).toBe(2);
        const { stream: stream3 } = stream2.advance();
        expect(stream3.column).toBe(2);
        expect(stream3.row).toBe(2);
        const { stream: stream4 } = stream3.advance();
        expect(stream4.column).toBe(3);
        expect(stream4.row).toBe(2);
    })

    test("is pure", () => {
        const result = stream.advance();
        expect(result).toStrictEqual(stream.advance());
    })
})