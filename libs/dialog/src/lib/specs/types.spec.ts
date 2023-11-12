import { DialogRef } from '../dialog-ref';
import { ExtractData, ExtractResult } from '../types';

// Helper functions

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// Type tests for ExtractData helper

type WellDefinedStringData = ExtractData<{ ref: DialogRef<string> }>;
type WellDefinedObjectData = ExtractData<{ ref: DialogRef<{ key: string }> }>;
type WellDefinedUnknownData = ExtractData<{ ref: DialogRef<unknown> }>;
type WellDefinedAnyData = ExtractData<{ ref: DialogRef }>;
type ImplicitAnyData = ExtractData<{ ref: DialogRef }>;
type MissingRefData = ExtractData<{}>;

type dataCases = [
  Expect<Equal<WellDefinedStringData, string>>,
  Expect<Equal<WellDefinedObjectData, { key: string }>>,
  Expect<Equal<WellDefinedUnknownData, unknown>>,
  Expect<Equal<WellDefinedAnyData, any>>,
  Expect<Equal<ImplicitAnyData, any>>,
  Expect<Equal<MissingRefData, any>>,
];

// Type tests for ExtractResult helper

type WellDefinedStringResult = ExtractResult<{ ref: DialogRef<unknown, string> }>;
type WellDefinedObjectResult = ExtractResult<{ ref: DialogRef<unknown, { key: string }> }>;
type WellDefinedUnknownResult = ExtractResult<{ ref: DialogRef<unknown, unknown> }>;
type WellDefinedAnyResult = ExtractResult<{ ref: DialogRef<unknown> }>;
type ImplicitAnyResult = ExtractResult<{ ref: DialogRef<unknown> }>;
type MissingRefResult = ExtractResult<{}>;

type resultCases = [
  Expect<Equal<WellDefinedStringResult, string | undefined>>,
  Expect<Equal<WellDefinedObjectResult, { key: string } | undefined>>,
  Expect<Equal<WellDefinedUnknownResult, unknown | undefined>>,
  Expect<Equal<WellDefinedAnyResult, any | undefined>>,
  Expect<Equal<ImplicitAnyResult, any | undefined>>,
  Expect<Equal<MissingRefResult, any | undefined>>,
];
