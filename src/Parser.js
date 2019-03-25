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
        
const withDefault = x => parser =>
    map (optional (parser))
        (option => option ? option : x);

const pipe = ([head, ...tail]) =>
    head === undefined ?
        return_ ([]) :
        bind
            (head)
            (h => map
                (pipe (tail))
                (t => [h].concat(t)));

const ignore = ([head, ...tail]) => 
    head === undefined ?
        return_ (undefined) :
        bind (head) (_ => ignore (tail));

const do_ = ({first = [], apply, then = []}) => 
    bind
        (ignore (first))
        (_ => bind
            (apply)
            (value => map
                (ignore (then))
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
        return new Failure("Expected eof, got: " + result.value);
    }
}

 const char = predicate =>
    bind
        (any)
        (x => predicate (x) ? 
            return_ (x) : 
            fail (x + "does not match predicate."));

const many = parser => stream =>
    bind 
        (optional (parser))
        (head => stream_ =>
            head === undefined ?
                return_ ([]) (stream_) :
            stream === stream_ ?
                fail ("infinite loop detected.") (stream) :
                map
                    (many (parser))
                    (tail => [].concat([head], tail))
                    (stream_))
        (stream);

/*const many = parser => stream => {
    const result = parser (stream);
    if (result instanceof Failure) {
        return new Success([], stream);
    } else {
        if (result.stream === stream) {
            return new Failure("Infinite loop detected.", stream);
        } else {
            return map 
                (many (parser))
                (value => [result.value].concat(value))
                (result.stream)
        }
    }
}*/

const many1 = parser =>
    bind
        (parser)
        (head => map
            (many (parser))
            (tail => [head].concat(tail)));

const manySepEndBy = parser => separator =>
    bind
        (optional (pipe ([parser, optional(separator)])))
        (value => {
            if (!value) {
                return return_ ([]);
            } else if (!value[1]) {
                return return_([value[0]]);
            } else {
                return map
                    (many(do_ ({ apply: parser, then: [optional(separator)] })))
                    (tail => [value[0]].concat(tail));
            }
        });

const many1SepEndBy = parser => separator => 
    bind 
        (parser)
        (head => stream => {
            const sep = separator (stream);
            if (sep instanceof Failure) {
                return new Success([head], stream);
            } else {
                return map
                    (manySepEndBy (parser) (separator))
                    (value => [head].concat(value))
                    (sep.stream);
            }
        });


const manySepBy = parser => separator => stream => {
    const result = parser (stream);
    if (result instanceof Failure) {
        return new Success([], stream);
    } else {
        const separatorResult = separator (result.stream);
        if (separatorResult instanceof Failure) {
            return new Success([result.value], result.stream);
        } else {
            if (stream === separatorResult.stream) {
                return new Failure("Infinite loop detected.", stream);
            } else {
                return map
                    (many1SepBy (parser) (separator))
                    (tail => [result.value].concat(tail))
                    (separatorResult.stream);
            }
        }
    }
}

const many1SepBy = parser => separator => stream =>
    bind
        (parser)
        (head => stream_ => {
            const separatorResult = separator (stream_);
            if (separatorResult instanceof Failure) {
                return new Success([head], stream_);
            } else {
                if (stream === separatorResult.stream) {
                    return new Failure("Infinite loop detected.", stream);
                } else {
                    return map
                        (many1SepBy (parser) (separator))
                        (tail => [head].concat(tail))
                        (separatorResult.stream);
                }
            }
        })
        (stream);

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