import { expectType } from "tsd";
import parseUrl from "../index";

// test type exports
type PU = parseUrl.ParsedUrl;
type NO = parseUrl.NormalizeOptions;
type Err = parseUrl.ParsingError;

expectType<parseUrl.ParsedUrl>(parseUrl("http://ionicabizau.net/blog"));
expectType<parseUrl.ParsedUrl>(parseUrl("http://ionicabizau.net/blog", true));
expectType<parseUrl.ParsedUrl>(
  parseUrl("http://ionicabizau.net/blog", { stripHash: true })
);

declare const err: parseUrl.ParsingError;
expectType<string>(err.subject_url);

expectType<2048>(parseUrl.MAX_INPUT_LENGTH);
