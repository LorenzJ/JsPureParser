import CharStream from "./CharStream";
import Parser from "./Parser";
import { Success, Failure } from "./Result";

function test() {
    const stream = CharStream.FromString("1,2,123 ab");
    const parser = Parser.manySepEndBy (Parser.integer) (Parser.char (c => c === ','));
    const result = parser (stream);
}

test();