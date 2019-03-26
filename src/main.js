import CharStream from "./CharStream";
import Parser from "./Parser";
import { Success, Failure } from "./Result";

function test() {
    const parser = Parser.string ("H");
    const result = parser (CharStream.FromString("H"));
}

test();