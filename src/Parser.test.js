import Parser from './Parser';
import CharStream from './CharStream';
import { Success, Failure } from './Result';

describe("Parser", () => {
    
    test("return", () => {
        const parser = Parser.return (0);
        const result = parser (null);
        expect(result).toBeInstanceOf(Success);
        expect(result.value).toBe(0);
    });

    test("map", () => {
        const parser = Parser.map 
            (Parser.any)
            (c => +c);
        const result = parser (CharStream.FromString("5"));
        expect(result).toBeInstanceOf(Success);
        expect(result.value).toBe(5);
    });

    describe ("withDefault", () => {

        const parser = Parser.bind
            (Parser.withDefault (0) (Parser.integer))
            (i => Parser.map
                (Parser.any)
                (a => "" + i + a));

        test("Default is returned when parser fails", () => {
            const stream = CharStream.FromString("a");
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toBe("0a");
        });

        test("Parsed value is returned when parser succeeds", () => {
            const stream = CharStream.FromString("1a");
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toBe("1a");
        });
    });
    

    describe("many", () => {

        test("many succeeds on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.many (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("many succeeds on 0 matches", () => {
            const stream = CharStream.FromString("Hello world");
            const parser = Parser.many (Parser.char (c => c === ' '));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("many succeeds on 1 or more matches", () => {
            const stream = CharStream.FromString("abc 123");
            const parser = Parser.many (Parser.char (c => c !== ' '));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual(['a', 'b', 'c']);
            const after = Parser.any (result.stream);
            expect(after).toBeInstanceOf(Success);
            expect(after.value).toStrictEqual(' ');
        });
    
        test("many fails on an infinite parser", () => {
            const stream = CharStream.FromString("Hello");
            const parser1 = Parser.many (Parser.position);
            const result1 = parser1 (stream);
            expect(result1).toBeInstanceOf(Failure);
            const parser2 = Parser.many (Parser.many (Parser.any));
            const result2 = parser2 (stream);
            expect(result2).toBeInstanceOf(Failure);
        });
    })
    
    describe("many1", () => {

        test("many1 fails on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.many1 (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1 fails on 0 matches", () => {
            const stream = CharStream.FromString("fjdqsml");
            const parser = Parser.many1 (Parser.char (c => c === ' '));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1 succeeds on 1 or more matches", () => {
            const stream = CharStream.FromString("fjd qsml");
            const parser = Parser.many1 (Parser.char (c => c !== ' '));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual(['f', 'j', 'd']);
        });    
    })
    
    describe("manySepEndBy", () => {
        test("manySepEndBy succeeds on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.manySepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("manySepEndBy succeeds on 0 matches", () => {
            const stream = CharStream.FromString("abc,123");
            const parser = Parser.manySepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("manySepEndBy succeeds on 1 or more matches without trailing separator", () => {
            const stream = CharStream.FromString("1,2,123 ab");
            const parser = Parser.manySepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1, 2, 123]);
        });
    
        test("manySepEndBy succeeds on 1 or more matches with trailing separator", () => {
            const stream = CharStream.FromString("1,2,123,ab");
            const parser = Parser.manySepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1, 2, 123]);
        });
    
        test("manySepEndBy fails on an infinite parser", () => {
            const stream = CharStream.FromString("fdqs");
            const parser = Parser.manySepEndBy (Parser.position) (Parser.position);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    })
    
    describe("many1SepEndBy", () => {
        test("many1SepEndBy fails on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.many1SepEndBy (Parser.any) (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1SepEndBy fails on 0 matches", () => {
            const stream = CharStream.FromString("a,b,c");
            const parser = Parser.many1SepEndBy (Parser.integer) (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1SepEndBy succeeds on 1 or more matches without trailing separator", () => {
            const stream = CharStream.FromString("1,2,123 ab");
            const parser = Parser.many1SepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1, 2, 123]);
        });
    
        test("many1SepEndBy succeeds on 1 or more matches with trailing separator", () => {
            const stream = CharStream.FromString("1,2,123,ab");
            const parser = Parser.many1SepEndBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1, 2, 123]);
        });
    });
    
    describe("many1SepBy", () => {
        test("many1SepBy fails on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.many1SepBy (Parser.any) (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1SepBy fails on no matches", () => {
            const stream = CharStream.FromString("hello,test");
            const parser = Parser.many1SepBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1SepBy succeeds on 1 or more matches without trailing separator", () => {
            const stream = CharStream.FromString("1,2,3");
            const parser = Parser.many1SepBy (Parser.integer) (Parser.char(c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1,2,3]);
        });
    
        test("many1SepBy fails on 1 or more matches with trailing separator", () => {
            const stream = CharStream.FromString("1,2,3,");
            const parser = Parser.many1SepBy (Parser.integer) (Parser.char(c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    
        test("many1SepBy fails on infinite matches.", () => {
            const stream = CharStream.FromString("dqfs");
            const parser = Parser.many1SepBy (Parser.position) (Parser.position);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    });
    
    describe("manySepBy", () => {
        test("manySepBy succeeds on empty input", () => {
            const stream = CharStream.FromString("");
            const parser = Parser.manySepBy (Parser.any) (Parser.any);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("manySepBy succeeds on 0 matches", () => {
            const stream = CharStream.FromString("abc,def");
            const parser = Parser.manySepBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([]);
        });
    
        test("manySepBy succeeds on 1 or more matches without a trailing separator", () => {
            const stream = CharStream.FromString("123,456,24");
            const parser = Parser.manySepBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([123,456,24]);
        });
    
        test("manySepBy fails on 1 or more matches with a trailing separator", () => {
            const stream = CharStream.FromString("123,456,24,");
            const parser = Parser.manySepBy (Parser.integer) (Parser.char (c => c === ','));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    });
    
    describe("choice", () => {
        test("choice succeeds on any match", () => {
            const stream = CharStream.FromString("a12a10b");
            const parser = Parser.many1 (Parser.choice ([Parser.integer, Parser.char (c => c === 'a')]));
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual(['a', 12, 'a', 10]);
        });
    
        test("choice fails on no match", () => {
            const stream = CharStream.FromString("abcdefghijklmnopqrstuvwxyz&");
            const parser = Parser.choice ([Parser.integer, Parser.char (c => c.toUpperCase() === c)]);
            const result = parser (stream);
            expect(result).toBeInstanceOf(Failure);
        });
    });

    test("do returns the result of the 'apply' parser", () => {
        const stream = CharStream.FromString("( 42 )");
        const symbol = s => Parser.char (c => c === s);
        const spaces = Parser.many(Parser.char (c => c === ' '));
        const parser = Parser.do({
            first: [symbol ('('), spaces],
            apply: Parser.integer,
            then:  [spaces, symbol(')'), Parser.eof]
        });
        const result = parser (stream);
        expect(result).toBeInstanceOf(Success);
        expect(result.value).toBe(42);
    });

    test("pipe returns all results for each parser", () => {
        const stream = CharStream.FromString(" 0");
        const spaces = Parser.many (Parser.char (c => c === ' '));
        const parser = Parser.pipe ([spaces, Parser.char (c => c === '0')]);
        const result = parser (stream);
        expect(result).toBeInstanceOf(Success);
        expect(result.value).toStrictEqual([[' '], '0']);
    });

    describe("complex recursive parser", () => {
        const isSpace = c => c === ' ' || c === '\t' || c === '\n' || c === '\r';
        const spaces = Parser.many (Parser.char (isSpace));
        const symbol = s => Parser.do ({apply: Parser.char (c => c === s), then: [spaces]});
        const between = begin => end => p =>
            Parser.do ({first: [begin], apply: p, then: [end]});
        const betweenBrackets = between (symbol ('(')) (symbol (')'));
        const value = Parser.lazy (() => Parser.choice ([list, number, identifier]));
        const identifier = Parser.map
            (Parser.do ({ 
                apply: Parser.many1 (Parser.char (c => !isSpace(c) && c !== '(' && c !== ')')),
                then: [spaces]}))
            (chars => chars.join(""))
        const number = Parser.do ({ apply: Parser.integer, then: [spaces]});
        const list = betweenBrackets (Parser.many (value));
        
        test("Identifiers", () => {
            const result1 = identifier (CharStream.FromString("hello()"));
            expect(result1).toBeInstanceOf(Success);
            expect(result1.value).toBe("hello");
            
            const result2 = identifier (CharStream.FromString("is-digit? + ok"));
            expect (result2).toBeInstanceOf(Success);
            expect(result2.value).toBe("is-digit?");
        });

        test("Between Brackets", () => {
            const identifierBetweenBrackets = betweenBrackets (identifier);
            const result = identifierBetweenBrackets (CharStream.FromString ("( test )"));
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toBe("test");
        });

        test("Simple list", () => {
            const stream = CharStream.FromString("(1 2 3)");
            const result = list (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual([1, 2, 3]);
        });

        test("Complex list", () => {
            const stream = CharStream.FromString("(a 1 (b c) d)");
            const result = list (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual(['a', 1, ['b', 'c'], 'd']);
        });

        test("Complex expression", () => {
            const input =
                "(def (fact x)" +
                "   (if (= 0 x)" +
                "       1" +
                "       (* x (fact (- x 1)))))";
            const stream = CharStream.FromString(input);
            const result = value (stream);
            expect(result).toBeInstanceOf(Success);
            expect(result.value).toStrictEqual(
                ['def', ['fact', 'x'], 
                    ['if', ['=', 0, 'x'], 
                        1, 
                        ['*', 'x', ['fact', ['-', 'x', 1]]]]]);
        });
        
    });

    describe("JSON", () => {
        test("Parse json", () => {
            const ws = 
                Parser.many(
                Parser.char (c => c === '\t' || c === '\n' || c === ' ' || c === '\t' || c === '\r'));
            const followedByWs = p => Parser.do ({ apply: p, then: [ws]});
            const between = start => end => p => Parser.do ({first: [start], apply: p, then: [end]});
            const symbol = s => followedByWs (Parser.char (c => c === s));

            const value = Parser.lazy(() => Parser.choice([number, string, array, object]));
            const number = followedByWs (Parser.integer);
            const string = 
                Parser.map
                    (between (symbol ('"')) (symbol ('"')) (followedByWs (Parser.many(Parser.char (c => c !== '"')))))
                    (x => x.join(""));
            const keyValuePair = 
                Parser.pipe ([
                    (Parser.do ({ apply: string, then: [symbol(':')]})),
                    (value)]);
            const array = between (symbol ('[')) (symbol (']')) (Parser.manySepBy (value) (symbol (',')));
            const object = between (symbol ('{')) (symbol ('}')) (Parser.manySepBy (keyValuePair) (symbol (',')));
            
            const parser = Parser.do ({ first: [ws], apply: value, then: [ws] });
            const stream = CharStream.FromString('["abc", 5, 6, {"x": 5, "obj": { "arr": [1, [2]]}}]');
            
            const result = parser (stream);
            expect(result).toBeInstanceOf(Success);
        });
        
    });

});