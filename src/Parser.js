import { Success, Failure } from "./Result";

const position = stream => new Success([stream.row, stream.column], stream);

const lazy = f => stream => f () (stream);

const return_ = x => stream => new Success(x, stream);

const fail = message => stream =>
    new Failure(message, stream);

const bind = parser => f => stream => 
    parser (stream).bind((value, stream) => f (value) (stream));

const map = parser => f =>
    bind (parser)
        (x => return_ (f (x)));

const optional = parser => stream => {
    const result = parser (stream);
    if (result instanceof Failure) {
        return new Success(undefined, stream);
    } else {
        return result;
    }
}

const string = str => stream => {
    const str_ = ([head, ...tail]) =>
        bind (any)
            (c => stream_ =>
                c === head ?
                    (tail.length === 0 ?
                        return_ (str) (stream_)
                    : str_ (tail) (stream_))
                : fail ("Got '" + c + "' expected '" + head + "'") (stream))
    return str_ (str) (stream);
}
        
const withDefault = x => parser =>
    map (optional (parser))
        (option => option ? option : x);

const pipe = ([head, ...tail]) =>
    head === undefined ?
        return_ ([]) :
        bind (head)
            (h => map (pipe (tail))
                (t => [h].concat(t)));

const ignore = ([head, ...tail]) => 
    head === undefined ?
        return_ (undefined) :
        bind (head) (_ => ignore (tail));

const do_ = ({first = [], apply, then = []}) => 
    bind(ignore (first))
        (_ => bind (apply)
            (value => map (ignore (then))
            (_ => value)));

const any = stream => {
    const { char, stream: stream1 } = stream.advance();
    return char
        ? new Success(char, stream1)
        : new Failure("End of file.", stream1);
}

const eof = stream => {
    const result = any (stream);
    if (result instanceof Failure) {
        return new Success(undefined, stream);
    } else {
        return new Failure("Expected eof, got: " + result.value, stream);
    }
}

 const char = predicate =>
    bind (any)
        (x => predicate (x) ? 
            return_ (x) : 
            fail (x + "does not match predicate."));

const many = parser => stream =>
    bind (optional (parser))
        (head => stream_ =>
            head === undefined ?
                return_ ([]) (stream_) :
            stream === stream_ ?
                fail ("infinite loop detected.") (stream) :
                map (many (parser))
                    (tail => [].concat([head], tail))
                    (stream_))
        (stream);

const many1 = parser =>
    bind (parser)
        (head => map (many (parser))
            (tail => [head].concat(tail)));

const manySepEndBy = parser => separator => stream =>
    bind (optional (parser))
        (head => stream_ => 
            head === undefined ? 
                return_ ([]) (stream_)
            : stream === stream_ ? 
                fail ("infinite loop detected.") (stream)
            : bind (optional (separator))
                (sep => sep === undefined
                    ? return_ ([head])
                    : map (manySepEndBy (parser) (separator))
                        (tail => [].concat([head], tail)))
                (stream_))
        (stream);

const many1SepEndBy = parser => separator =>
    bind (parser)
        (head => bind (optional (separator))
            (sep =>
                sep === undefined ? 
                    return_ ([head])
                : map (manySepEndBy (parser) (separator))
                    (tail => [].concat([head], tail))));

const many1SepBy = parser => separator => stream =>
    bind (parser)
        (head => stream_ => 
            head === undefined ? 
                return_ ([]) (stream_)
            : stream === stream_ ?
                fail ("infinite loop detected.") (stream)
            : bind (optional (separator))
                (sep => 
                    sep === undefined ? 
                        return_ ([head])
                    : map (many1SepBy (parser) (separator))
                        (tail => [].concat([head], tail)))
                (stream_))
        (stream);

const manySepBy = parser => separator => 
    bind (optional (parser))
        (head => head === undefined
            ? return_ ([])
            : bind (optional (separator))
            (sep =>sep === undefined
                ? return_ ([head])
                : map (many1SepBy (parser) (separator))
                    (tail => [].concat([head], tail))));

const integer =
    map
        (many1 (char (c => c >= '0' && c <= '9')))
        (chars => (+(chars.join(""))));

const choice = parsers => stream => {
    function choice_(p, e, stream) {
        if (p.length === 0) {
            return new Failure("Failed to parse choices: \n" + e.join("\n\t"));
        } else {
            const [parser, ...tail] = p;
            const result = parser (stream);
            if (result instanceof Success) {
                return result;
            } else {
                return choice_(tail, e.concat([result.message]), stream);
            }
        }
    }
    return choice_(parsers, [], stream);
}

export default {
    return: return_,
    fail: fail,
    bind: bind,
    map: map,
    optional: optional,
    withDefault: withDefault,
    position: position,
    char: char,
    string: string,
    any: any,
    eof: eof,
    lazy: lazy,
    many: many,
    many1: many1,
    manySepEndBy: manySepEndBy,
    many1SepEndBy: many1SepEndBy,
    manySepBy: manySepBy,
    many1SepBy: many1SepBy,
    integer: integer,
    pipe: pipe,
    choice: choice,
    do: do_
}